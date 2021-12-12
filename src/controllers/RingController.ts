import {Controller, Inject} from "@tsed/di";
import {Get} from "@tsed/schema";
import {QueryParams} from "@tsed/common";
import {NearestRingDto} from "../services/models/NearestRingDto";
import {RingService} from "../services/RingService";

@Controller('/rings')
export class RingController {
    @Inject()
    private readonly ringService: RingService

    @Get('/nearest')
    async findNearestRings(
        @QueryParams('latitude') latitude: number,
        @QueryParams('longitude') longitude: number,
        @QueryParams('radius') radius: number,
    ): Promise<NearestRingDto[]> {
        return this.ringService.findNearestRing(latitude, longitude, radius);
    }
}
