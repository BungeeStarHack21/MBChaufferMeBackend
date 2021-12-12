import {Controller, Inject} from "@tsed/di";
import {Get, Integer, Required} from "@tsed/schema";
import {QueryParams} from "@tsed/common";
import {NearestRingDto} from "../services/models/NearestRingDto";
import {RingService} from "../services/RingService";
import {ChauffeurAvailabilityDto} from "../services/models/ChauffeurAvailabilityDto";

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

    @Get("/:id/chauffeurs/availability")
    async checkChauffeurAvailability(
        @QueryParams('startChauffeurRingNodeTimeId') @Integer() @Required() startChauffeurRingNodeTimeId: number,
        @QueryParams('endChauffeurRingNodeTimeId') @Integer() @Required() endChauffeurRingNodeTimeId: number,
        @QueryParams('seatCount') @Integer() @Required() seatCount: number,
    ): Promise<ChauffeurAvailabilityDto> {
        return this.ringService.checkChauffeurAvailability(
            startChauffeurRingNodeTimeId,
            endChauffeurRingNodeTimeId,
            seatCount
        );
    }
}
