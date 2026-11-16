import type { MapDef } from '../story/types';
import { BANDUNG } from './bandung';
import { BANDUNG_SEPI } from './bandungSepi';
import { BANDUNG_SITI } from './bandungSiti';
import { JALANAN } from './jalanan';
import { MALANG } from './malang';
import { RUMAH_SITI } from './rumahSiti';

export const MAPS: Record<string, MapDef> = {
  bandung: BANDUNG,
  malang: MALANG,
  'rumah-siti': RUMAH_SITI,
  'bandung-siti': BANDUNG_SITI,
  'bandung-sepi': BANDUNG_SEPI,
  jalanan: JALANAN,
};
