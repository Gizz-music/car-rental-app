import { appendFile, readFile } from "node:fs/promises";
import { Agent, CursorAgentError } from "@cursor/sdk";

const apiKey = process.env.CURSOR_API_KEY?.trim();
const repo = process.env.REPO?.trim();
const headSha = process.env.HEAD_SHA?.trim();
const headBranch = process.env.HEAD_BRANCH?.trim();
const runUrl = process.env.RUN_URL?.trim() ?? "";
const prUrl = process.env.PR_URL?.trim() ?? "";
const logPath = process.argv[2];

if (!apiKey || !repo || !headSha || !headBranch) {
  console.error("Missing CURSOR_API_KEY, REPO, HEAD_SHA, or HEAD_BRANCH.");
  process.exit(1);
}

const onMain = headBranch === "main";
const log = await readLog(logPath);
const prompt = [
  `CI failed in ${repo} on branch ${headBranch} at commit ${headSha}.`,
  runUrl ? `Run: ${runUrl}` : "",
  "",
  "Fix the failure with the smallest change that makes lint, build, and tests pass.",
  "Do not disable checks, skip tests, or edit CI workflows to hide the failure.",
  "Do not commit secrets or print API keys.",
  "The commit message must start with [agent-fix].",
  onMain
    ? "This failure is on main. Put the fix on a new branch and open a pull request. Do not push to main."
    : "Push the fix to this same branch.",
  "",
  "Failed log tail:",
  log || "(log unavailable; reproduce with npm ci && npx turbo run lint build test)",
].join("\n");

try {
  const result = await Agent.prompt(prompt, {
    apiKey,
    model: { id: "composer-2.5" },
    name: `CI fix ${headSha.slice(0, 7)}`,
    idempotencyKey: `ci-fix-${headSha}`,
    cloud: {
      repos: [
        {
          url: `https://github.com/${repo}`,
          startingRef: headBranch,
          ...(prUrl ? { prUrl } : {}),
        },
      ],
      workOnCurrentBranch: !onMain,
      autoCreatePR: onMain || !prUrl,
      skipReviewerRequest: true,
    },
  });

  const pullRequest = result.git?.branches?.find((branch) => branch.prUrl)?.prUrl;
  console.log(`status=${result.status} run=${result.id}`);
  if (pullRequest) console.log(`pr=${pullRequest}`);
  if (result.result) console.log(result.result);
  await writeSummary(result.status, result.id, pullRequest);

  if (result.status === "error") {
    console.error(result.error?.message ?? "Agent run failed.");
    process.exit(2);
  }
  if (result.status !== "finished") {
    process.exit(2);
  }
} catch (error) {
  if (error instanceof CursorAgentError) {
    console.error(`startup failed: ${error.message}`);
    process.exit(1);
  }
  throw error;
}

async function readLog(path) {
  if (!path) return "";
  const raw = await readFile(path, "utf8").catch(() => "");
  const redacted = raw
    .split("\n")
    .filter((line) => !/crsr_|CURSOR_API_KEY\s*=/i.test(line))
    .join("\n");
  const max = 30_000;
  return redacted.length > max ? redacted.slice(-max) : redacted;
}

async function writeSummary(status, runId, pullRequest) {
  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (!summary) return;
  const lines = [
    "### Cursor agent",
    "",
    `- Status: ${status}`,
    `- Run: ${runId}`,
  ];
  if (pullRequest) lines.push(`- Pull request: ${pullRequest}`);
  await appendFile(summary, `${lines.join("\n")}\n`);
}
