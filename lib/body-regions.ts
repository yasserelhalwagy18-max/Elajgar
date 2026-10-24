/**
 * The body regions the app can record pain in.
 *
 * This is the single source of truth for the region ids. The heatmap used to
 * keep its own list and the 3D model kept another one with a third set of
 * ids, so the admin panel could not aggregate what users actually reported.
 * Every region now maps to one of the coarse buckets the 3D model draws.
 */

export type BodyView = 'front' | 'back';

/** The coarse regions the 3D model has a marker for. */
export type BodyBucket =
  | 'head'
  | 'neck'
  | 'shoulders'
  | 'chest'
  | 'back'
  | 'arms_l'
  | 'arms_r'
  | 'hips'
  | 'knees_l'
  | 'knees_r'
  | 'feet_l'
  | 'feet_r';

export interface BodyRegion {
  id: string;
  label: string;
  view: BodyView;
  /** Position as a percentage of the artwork. */
  top: string;
  left: string;
  /** The coarse region this belongs to. */
  bucket: BodyBucket;
}

/**
 * The regions, with the marker positions measured against `body-front.png`
 * and `body-back.png` (both 1984x2136): the body occupies 1.4%..91.9% of the
 * image height, the head 1.4%..9%, the shoulders ~16%, the waist ~40%, the
 * hips ~48% and the feet ~91%.
 *
 * Left/right are the *person's* left and right: in the back view the person's
 * left is on the viewer's left, in the front view it is mirrored.
 */
export const BODY_REGIONS: BodyRegion[] = [
  // Front view
  { id: 'head_front', label: 'سر', view: 'front', top: '4%', left: '50%', bucket: 'head' },
  { id: 'neck_front', label: 'گردن', view: 'front', top: '11.5%', left: '50%', bucket: 'neck' },
  { id: 'shoulders_front', label: 'شانه‌ها', view: 'front', top: '18.5%', left: '50%', bucket: 'shoulders' },
  { id: 'chest', label: 'قفسه سینه', view: 'front', top: '26%', left: '50%', bucket: 'chest' },
  { id: 'abdomen', label: 'شکم', view: 'front', top: '35%', left: '50%', bucket: 'chest' },
  { id: 'pelvis_front', label: 'لگن', view: 'front', top: '47%', left: '50%', bucket: 'hips' },
  { id: 'elbow_r_front', label: 'آرنج راست', view: 'front', top: '40%', left: '30%', bucket: 'arms_r' },
  { id: 'elbow_l_front', label: 'آرنج چپ', view: 'front', top: '40%', left: '70%', bucket: 'arms_l' },
  { id: 'wrist_r_front', label: 'مچ دست راست', view: 'front', top: '48%', left: '26%', bucket: 'arms_r' },
  { id: 'wrist_l_front', label: 'مچ دست چپ', view: 'front', top: '48%', left: '74%', bucket: 'arms_l' },
  { id: 'knee_r_front', label: 'زانو راست', view: 'front', top: '68%', left: '43%', bucket: 'knees_r' },
  { id: 'knee_l_front', label: 'زانو چپ', view: 'front', top: '68%', left: '57%', bucket: 'knees_l' },
  { id: 'ankle_r_front', label: 'مچ پا راست', view: 'front', top: '88%', left: '44%', bucket: 'feet_r' },
  { id: 'ankle_l_front', label: 'مچ پا چپ', view: 'front', top: '88%', left: '56%', bucket: 'feet_l' },

  // Back view
  { id: 'head_back', label: 'پشت سر', view: 'back', top: '4%', left: '50%', bucket: 'head' },
  { id: 'neck_back', label: 'پشت گردن', view: 'back', top: '11.5%', left: '50%', bucket: 'neck' },
  { id: 'shoulder_l_back', label: 'شانه چپ', view: 'back', top: '18%', left: '38%', bucket: 'shoulders' },
  { id: 'shoulder_r_back', label: 'شانه راست', view: 'back', top: '18%', left: '62%', bucket: 'shoulders' },
  { id: 'upper_back', label: 'پشت (بالا)', view: 'back', top: '26%', left: '50%', bucket: 'back' },
  { id: 'lower_back', label: 'کمر', view: 'back', top: '35%', left: '50%', bucket: 'back' },
  { id: 'glutes', label: 'باسن', view: 'back', top: '48%', left: '50%', bucket: 'hips' },
  { id: 'elbow_l_back', label: 'آرنج چپ', view: 'back', top: '40%', left: '30%', bucket: 'arms_l' },
  { id: 'elbow_r_back', label: 'آرنج راست', view: 'back', top: '40%', left: '70%', bucket: 'arms_r' },
  { id: 'wrist_l_back', label: 'مچ دست چپ', view: 'back', top: '46%', left: '26%', bucket: 'arms_l' },
  { id: 'wrist_r_back', label: 'مچ دست راست', view: 'back', top: '46%', left: '74%', bucket: 'arms_r' },
  { id: 'hamstring_l', label: 'پشت ران چپ', view: 'back', top: '60%', left: '43%', bucket: 'knees_l' },
  { id: 'hamstring_r', label: 'پشت ران راست', view: 'back', top: '60%', left: '57%', bucket: 'knees_r' },
  { id: 'calf_l', label: 'ساق پا چپ', view: 'back', top: '75%', left: '43%', bucket: 'knees_l' },
  { id: 'calf_r', label: 'ساق پا راست', view: 'back', top: '75%', left: '57%', bucket: 'knees_r' },
  { id: 'heel_l', label: 'پاشنه پا چپ', view: 'back', top: '88%', left: '44%', bucket: 'feet_l' },
  { id: 'heel_r', label: 'پاشنه پا راست', view: 'back', top: '88%', left: '56%', bucket: 'feet_r' },
];

/** The label shown for each coarse bucket on the 3D model. */
export const BODY_BUCKET_LABELS: Record<BodyBucket, string> = {
  head: 'سر',
  neck: 'گردن',
  shoulders: 'شانه‌ها',
  chest: 'قفسه سینه',
  back: 'کمر',
  arms_l: 'دست چپ',
  arms_r: 'دست راست',
  hips: 'لگن',
  knees_l: 'زانو چپ',
  knees_r: 'زانو راست',
  feet_l: 'پای چپ',
  feet_r: 'پای راست',
};

const REGION_BY_ID = new Map(BODY_REGIONS.map((region) => [region.id, region]));

/**
 * The body families a region can belong to, before the left/right side is
 * applied.
 */
type BodyFamily =
  | 'head'
  | 'neck'
  | 'shoulders'
  | 'chest'
  | 'back'
  | 'hips'
  | 'arms'
  | 'knees'
  | 'feet';

/**
 * Keyword matching, ordered from the most specific family to the least.
 *
 * The order matters: "پشت ران چپ" contains both "پشت" (back) and "ران"
 * (thigh), and it has to resolve to the leg, not to the back.
 */
const FAMILY_KEYWORDS: Array<{ family: BodyFamily; keywords: string[] }> = [
  { family: 'head', keywords: ['head', 'سر'] },
  { family: 'neck', keywords: ['neck', 'گردن'] },
  { family: 'shoulders', keywords: ['shoulder', 'شانه'] },
  { family: 'chest', keywords: ['chest', 'abdomen', 'قفسه', 'شکم'] },
  { family: 'hips', keywords: ['pelvis', 'glutes', 'لگن', 'باسن'] },
  { family: 'knees', keywords: ['knee', 'hamstring', 'calf', 'زانو', 'ران', 'ساق'] },
  { family: 'feet', keywords: ['ankle', 'heel', 'پاشنه', 'پا'] },
  { family: 'arms', keywords: ['elbow', 'wrist', 'آرنج', 'دست'] },
  { family: 'back', keywords: ['back', 'کمر', 'پشت'] },
];

/**
 * Resolve a reported pain zone to its coarse bucket.
 *
 * Returns null when the zone is not recognised - the caller then skips it
 * rather than guessing.
 */
export function resolveBucket(zone: string | null | undefined): BodyBucket | null {
  if (!zone) return null;

  const known = REGION_BY_ID.get(zone);
  if (known) return known.bucket;

  const normalized = zone.trim().toLowerCase();

  const family = FAMILY_KEYWORDS.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword)),
  );
  if (!family) return null;

  const isLeft = normalized.includes('_l') || normalized.includes('left') || normalized.includes('چپ');
  const isRight = normalized.includes('_r') || normalized.includes('right') || normalized.includes('راست');

  switch (family.family) {
    case 'arms':
      return isLeft ? 'arms_l' : 'arms_r';
    case 'knees':
      return isLeft ? 'knees_l' : 'knees_r';
    case 'feet':
      return isLeft ? 'feet_l' : 'feet_r';
    default:
      return family.family;
  }
}

/** All the buckets, in the order the 3D model draws them. */
export const BODY_BUCKETS: BodyBucket[] = [
  'head',
  'neck',
  'shoulders',
  'chest',
  'back',
  'arms_l',
  'arms_r',
  'hips',
  'knees_l',
  'knees_r',
  'feet_l',
  'feet_r',
];

/**
 * Where each coarse region sits on the 3D model.
 *
 * The model is built from primitive shapes, so the markers are placed in the
 * same coordinate space as the body parts they belong to.
 */
export const BODY_BUCKET_POSITIONS: Record<BodyBucket, [number, number, number]> = {
  head: [0, 0.9, 0.1],
  neck: [0, 0.65, 0.05],
  shoulders: [0, 0.45, 0.1],
  chest: [0, 0.25, 0.15],
  back: [0, 0.05, -0.15],
  arms_l: [-0.4, 0.1, 0],
  arms_r: [0.4, 0.1, 0],
  hips: [0, -0.3, 0.1],
  knees_l: [-0.2, -0.8, 0.12],
  knees_r: [0.2, -0.8, 0.12],
  feet_l: [-0.2, -1.3, 0.1],
  feet_r: [0.2, -1.3, 0.1],
};
