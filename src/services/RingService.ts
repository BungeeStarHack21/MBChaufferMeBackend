import {Ring, RingNode, UserChauffeurRingNodeTime} from "@prisma/client";
import {Inject, Injectable} from "@tsed/di";
import {NearestRingDto} from "./models/NearestRingDto";
import {PrismaService} from "./PrismaService";

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