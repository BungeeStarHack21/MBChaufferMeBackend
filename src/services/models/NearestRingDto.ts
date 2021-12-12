export class NearestRingDto {
    constructor(id: number, name: string, nodes: { id: number; order: number; name: string; latitude: number; longitude: number; chauffeurTimes: { id: number; time: Date }[] }[]) {
        this.id = id;
        this.name = name;
        this.nodes = nodes;
    }

    id: number;
    name: string;
    nodes: {
        id: number;
        order: number;
        name: string;
        latitude: number;
        longitude: number;
        chauffeurTimes: {
            id: number;
            time: Date;
        }[];
    }[];
}