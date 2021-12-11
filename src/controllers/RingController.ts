import {Controller} from "@tsed/di";
import {Get} from "@tsed/schema";
import {QueryParams} from "@tsed/common";

@Controller('/rings')
export class RingController {

    @Get('/nearest')

    findNearestRings(@QueryParams('lat') lat: number, ) {

    }
}
