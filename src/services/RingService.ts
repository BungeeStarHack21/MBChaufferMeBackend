import {Ring, RingNode, UserChauffeurRingNodeTime, UserRide} from "@prisma/client";
import {Inject, Injectable} from "@tsed/di";
import {NearestRingDto} from "./models/NearestRingDto";
import {PrismaService} from "./PrismaService";
import {ChauffeurAvailabilityDto} from "./models/ChauffeurAvailabilityDto";
import {BadRequest} from "@tsed/exceptions";
import {ResourceNotFound} from "@tsed/common";

type RingWithItsNodes = (Ring & { ringNodes: (RingNode & { ringNodeTimes: UserChauffeurRingNodeTime[] })[] });
type RingWithItsNodesAndCenterPosition = RingWithItsNodes & { center: { latitude: number, longitude: number } }

@Injectable()
export class RingService {
    @Inject()
    private readonly prismaService: PrismaService;

    async findNearestRing(latitude: number, longitude: number, radius: number): Promise<NearestRingDto[]> {
        const rings: RingWithItsNodes[] = await this.prismaService.ring.findMany({
            include: {
                ringNodes: {
                    include: {
                        ringNodeTimes: true
                    }
                }
            }
        });

        const convertedRings = RingService.calculateCenterPosition(rings);

        const ringsInRange = RingService.findRingsInRange(latitude, longitude, convertedRings, radius);

        return ringsInRange
            .map(e => new NearestRingDto(
                e.id,
                e.name,
                e.ringNodes.map(node => ({
                    id: node.id,
                    order: node.order,
                    name: node.name,
                    latitude: node.latitude,
                    longitude: node.longitude,
                    chauffeurTimes: node.ringNodeTimes.map(time => ({
                        id: time.id,
                        time: time.time
                    })),
                }))
            ));
    }

    async checkChauffeurAvailability(
        startChauffeurRingNodeTimeId: number,
        endChauffeurRingNodeTimeId: number,
        seatCount: number
    ): Promise<ChauffeurAvailabilityDto> {
        const startChaufferRingNodeTime = await this.prismaService.userChauffeurRingNodeTime.findFirst({
            where: {
                id: startChauffeurRingNodeTimeId
            },
            include: {chauffeur: true}
        });

        const endChaufferRingNodeTime = await this.prismaService.userChauffeurRingNodeTime.findFirst({
            where: {
                id: endChauffeurRingNodeTimeId
            }
        });

        if (startChaufferRingNodeTime == null || endChaufferRingNodeTime == null) {
            throw new ResourceNotFound('ChaufferRingNodeTime not found');
        }

        let chauffeurId = startChaufferRingNodeTime.chauffeurId;

        const chauffeur = startChaufferRingNodeTime.chauffeur;

        const chauffeurNodeTimes = await this.prismaService.userChauffeurRingNodeTime.findMany({
            where: {chauffeur: {userId: chauffeurId}},
            include: {ringNode: true, startUserRides: true, endUserRides: true}
        });

        chauffeurNodeTimes.sort((a, b) => a.ringNode.order - b.ringNode.order)

        let currentSeatCount = chauffeur.seatCount;

        for (const chauffeurNodeTime of chauffeurNodeTimes) {
            let seatCountDifference = chauffeurNodeTime.endUserRides.reduce((a, b) => a + b.seatCount, 0) -
                chauffeurNodeTime.startUserRides.reduce((a, b) => a + b.seatCount, 0)

            currentSeatCount += seatCountDifference;

            console.log(currentSeatCount);
            
            if (seatCount > currentSeatCount &&
                startChaufferRingNodeTime.time >= chauffeurNodeTime.time &&
                chauffeurNodeTime.time <= endChaufferRingNodeTime.time) {
                return new ChauffeurAvailabilityDto(false);
            }
        }

        // if (seatCount > currentSeatCount) {
        //     return new ChauffeurAvailabilityDto(false);
        // }

        return new ChauffeurAvailabilityDto(true);
    }

    private static findRingsInRange(latitude: number, longitude: number, rings: RingWithItsNodesAndCenterPosition[], radius: number): RingWithItsNodesAndCenterPosition[] {
        return rings.filter(ring => {
            const distance = Math.sqrt(
                Math.pow((latitude - ring.center.latitude), 2) +
                Math.pow((longitude - ring.center.longitude), 2)
            );

            return distance < radius;
        })
    }

    private static calculateCenterPosition(rings: RingWithItsNodes[]): RingWithItsNodesAndCenterPosition[] {
        let casted: RingWithItsNodesAndCenterPosition[] = []

        for (const ring of rings) {
            const converted = (ring as RingWithItsNodesAndCenterPosition);

            let nodeCount = converted.ringNodes.length;

            const centerLatitude = converted.ringNodes.reduce(
                (a, b) => a + b.latitude, 0
            ) / nodeCount;

            const centerLongitude = converted.ringNodes.reduce(
                (a, b) => a + b.longitude, 0
            ) / nodeCount;

            converted.center = {
                latitude: centerLatitude,
                longitude: centerLongitude
            };

            casted.push(converted);
        }

        return casted;
    }
}