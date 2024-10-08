import type { Location, TypedArray } from '../types.js';
import { TILE_SIZE } from '../renderTile.js';

import { tilePixelFromLatLonZoom } from './math.js';
import CogReader from './CogReader.js';

const locationValues = async (
    url: string,
    { latitude, longitude }: Location,
    zoom?: number,
): Promise<Array<number>> => {
    const cog = CogReader(url);

    const { minzoom, maxzoom } = await cog.getTilejson(url);
    const { noData } = await cog.getMetadata();

    const normalizedZoom =
        zoom === undefined
            ? maxzoom
            : Math.max(minzoom, Math.min(maxzoom, Math.round(zoom)));

    const { tileIndex, column, row } = tilePixelFromLatLonZoom({
        latitude,
        longitude,
        zoom: normalizedZoom,
    });

    const tile = await cog.getRawTile(tileIndex);

    return tile.map((band: TypedArray) => {
        const rawValue = band[row * TILE_SIZE + column];
        if (rawValue === Infinity || rawValue === noData) {
            return NaN;
        } else {
            return rawValue;
        }
    });
};

export default locationValues;
