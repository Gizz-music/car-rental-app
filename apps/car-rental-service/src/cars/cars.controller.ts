import { Controller } from '@nestjs/common';
import { carRental } from '@car-rental/contracts';
import { CarsService } from './cars.service';

@Controller()
@carRental.CarsServiceControllerMethods()
export class CarsController implements carRental.CarsServiceController {
  constructor(private readonly carsService: CarsService) {}

  listCars(request: carRental.ListCarsRequest) {
    return this.carsService.list(request);
  }
}
