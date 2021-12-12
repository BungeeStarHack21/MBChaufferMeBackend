import {Inject, Injectable} from "@tsed/di";
import {RingService} from "./RingService";
import {BookUserRideRequestDto} from "./models/BookUserRideRequestDto";
import {BookUserRideResponseDto} from "./models/BookUserRideResponseDto";
import {PrismaService} from "./PrismaService";
import {RideStatus} from "@prisma/client";

@Injectable()
export class RideService {
    @Inject()
    private readonly ringService: RingService;
    @Inject()
    private readonly prismaService: PrismaService;

    async bookUserRide(body: BookUserRideRequestDto): Promise<BookUserRideResponseDto> {
        const bookAvailable = await this.ringService.checkChauffeurAvailability(
            body.startChauffeurRingNodeTimeId,
            body.endChauffeurRingNodeTimeId, body.seatCount);

        if (!bookAvailable.available) {
            return new BookUserRideResponseDto(false);
        }
        await this.prismaService.userRide.create({
            data: {
                customerUserId: body.customerUserId,
                status: RideStatus.ACTIVE,
                startChauffeurRingNodeTimeId: body.startChauffeurRingNodeTimeId,
                endChauffeurRingNodeTimeId: body.endChauffeurRingNodeTimeId,
                seatCount: body.seatCount
            }
        });
        return new BookUserRideResponseDto(true);
    }
}