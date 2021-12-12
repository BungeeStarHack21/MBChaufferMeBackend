import {Controller, Inject} from "@tsed/di";
import {Post} from "@tsed/schema";
import {BookUserRideRequestDto} from "../services/models/BookUserRideRequestDto";
import {BodyParams} from "@tsed/common";
import {RideService} from "../services/RideService";
import {BookUserRideResponseDto} from "../services/models/BookUserRideResponseDto";

@Controller('/rides')
export class RideController {
    @Inject()
    private readonly rideService: RideService;

    @Post()
    async bookUserRide(
        @BodyParams() body: BookUserRideRequestDto): Promise<BookUserRideResponseDto> {
        return this.rideService.bookUserRide(body);
    }
}