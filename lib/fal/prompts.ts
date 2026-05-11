// lib/fal/prompts.ts
import type { ServiceId } from '@/app/admin/editor/new/Intake';

/* ─────────────────────────────────────────────────────────────────────────
   BASE REALISM
   Applied to every prompt. Locks camera spec, HDR source, photoreal output,
   original aspect ratio, and explicit no-border rules.
   ─────────────────────────────────────────────────────────────────────── */
const BASE_REALISM = [
  'Photorealistic professional real-estate interior photograph.',
  'SOURCE: shot on a Sony A7R V full-frame mirrorless camera (61 megapixel back-illuminated',
  'sensor, 14-bit RAW), with a Sony FE 16-35mm GM wide-angle lens between 16 and 24mm,',
  'f/8 aperture for deep depth of field, ISO 100, on a sturdy tripod. The input image is an',
  'HDR composite merged from three to five bracketed exposures and tone-mapped to a natural,',
  'balanced result that holds detail in both the bright window highlights and the interior',
  'shadows simultaneously. White balance is corrected to daylight (~5500K) with subtle warm',
  'tungsten accents where artificial lights are on.',
  'OUTPUT REQUIREMENTS: photoreal at all viewing scales, sharp edge-to-edge focus, accurate',
  'perspective with vertical lines perfectly vertical (architectural correction applied),',
  'no warped lines, no bent walls, no impossible reflections, no impossible geometry,',
  'no extra rooms, no surreal or fantasy elements, no oversaturation, no HDR halos around',
  'window frames, no chromatic aberration, no obvious AI artifacts, no duplicated furniture,',
  'no melted or fused objects.',
  'FRAMING RULES: preserve the ORIGINAL aspect ratio of the input image exactly.',
  'Absolutely NO borders, NO black bars, NO white bars, NO letterboxing, NO pillarboxing,',
  'NO frame around the image, NO vignette, NO Polaroid-style border, NO film-strip edges,',
  'NO postcard or print mat. The image must fill the entire output canvas edge-to-edge as',
  'a clean rectangular photograph.',
  'NO text, NO watermarks, NO logos, NO captions, NO timestamps, NO EXIF burn-in.',
  'Output at 4096 pixels on the long edge in JPEG at maximum quality.',
].join(' ');

/* ─────────────────────────────────────────────────────────────────────────
   STYLE-SPECIFIC STAGING PROMPTS
   One dedicated prompt per furniture style — palette, named furniture pieces,
   specific materials, decor accents, lighting temperature, mood.
   ─────────────────────────────────────────────────────────────────────── */
const STAGE_PROMPTS: Record<string, string> = {
  modern: [
    'STAGING STYLE: CONTEMPORARY MODERN (Australian metro 2025 listing aesthetic).',

    'COLOUR PALETTE: warm off-white walls (Dulux Natural White or similar). Soft greige',
    'and oatmeal textiles. Charcoal and matte black accent pieces. Brushed nickel and',
    'matte black hardware. One restrained accent colour per room (sage, terracotta, or',
    'dusty olive) used in a single cushion or art piece — never multiple competing accents.',

    'LIVING ROOM FURNITURE (use whichever apply): a low-profile sectional or three-seat',
    'sofa upholstered in oatmeal bouclé or warm grey performance fabric, with deep seats',
    'and rounded arms. A sculptural mid-tone oak or walnut coffee table with softly',
    'rounded edges, sized correctly to the sofa. A matte black or brushed brass floor',
    'lamp with a linen drum shade. A pair of accent chairs in cream leather or grey',
    'wool. A low-pile flatweave rug in cream with subtle tonal texture, generously sized',
    'so the front legs of the sofa sit on it.',

    'BEDROOM FURNITURE (if room is a bedroom): a queen or king platform bed with an',
    'upholstered headboard in warm beige linen. White cotton sateen bedding with a',
    'tailored throw folded across the foot in muted sage or charcoal. Two matching',
    'bedside tables in mid-tone oak with simple matte black ceramic table lamps. A',
    'single piece of abstract art above the bed in muted earth tones.',

    'KITCHEN/DINING FURNITURE (if applicable): a solid timber dining table in oak or',
    'walnut, six dining chairs with curved backs upholstered in cream bouclé or with',
    'natural cane backs, a single low pendant or trio of pendants in matte black or',
    'brushed brass over the table. A simple ceramic bowl with fresh fruit as the only',
    'styling on the table.',

    'DECOR ACCENTS: matte ceramic vases in earthy tones, a single hand-thrown stoneware',
    'object, one tall potted plant (fiddle-leaf fig, olive tree, or rubber plant) in a',
    'matte terracotta or concrete planter. A coffee-table book in a monochrome jacket.',
    'Decor is RESTRAINED, intentional, and editorial — every object earns its place.',

    'LIGHTING MOOD: soft diffused 5500K daylight from the existing windows is the',
    'primary light. Lamps are switched off unless the room is dim, in which case a',
    'subtle 2700K warm glow from one floor lamp adds depth without competing with',
    'the daylight.',

    'AVOID: clutter, multiple competing patterns, ornate carvings, gold/baroque,',
    'plastic furniture, fast-fashion homewares, novelty items, themed decor,',
    'children\'s toys, religious iconography, family photos, mismatched pieces.',
  ].join(' '),

  scandinavian: [
    'STAGING STYLE: SCANDINAVIAN / NORDIC (Stockholm apartment aesthetic).',

    'COLOUR PALETTE: bright soft whites (Farrow & Ball Strong White or similar). Warm',
    'pale beige and oat. Cool dove grey. Blonde and pale ash wood — never dark wood.',
    'Hints of muted sage green, dusty blue, and pale terracotta as accents. Black is',
    'used sparingly only in fine lines (a thin picture frame, slender lamp stem).',

    'LIVING ROOM FURNITURE (use whichever apply): a slim-armed three-seat sofa in cream',
    'or pale grey linen with crisp piping and tapered pale wood legs. A pair of bentwood',
    'or cane-back accent chairs with cream wool cushions. A coffee table in pale ash or',
    'birch with tapered legs and a thin profile. A sheepskin throw draped loosely over',
    'one chair arm. A jute or wool rug in cream with a barely-visible woven pattern.',

    'BEDROOM FURNITURE (if room is a bedroom): a low pale-wood platform bed with no',
    'headboard or a soft cream linen headboard. White linen bedding (slightly wrinkled,',
    'lived-in look), a chunky cable-knit throw in cream or oat at the foot, two slim',
    'pillows. A pale wood bedside table with a small ceramic lamp with linen shade.',
    'A potted snake plant or trailing pothos on a stool nearby.',

    'KITCHEN/DINING (if applicable): a pale ash dining table with tapered legs, four to',
    'six Wishbone-style chairs (cane back, pale wood frame). A single ceramic pendant',
    'in soft white or pale grey above the table. A small ceramic vase with a sprig of',
    'eucalyptus or olive branches.',

    'DECOR ACCENTS: hand-thrown stoneware mugs and bowls in oat or pale grey. A thin',
    'black-framed graphic print (single line drawing, abstract botanical) above the sofa',
    'or bed. A pair of beeswax taper candles in simple ceramic holders on the table. One',
    'or two large indoor plants in matte terracotta pots — fig, olive, snake plant, or',
    'monstera. A small woven basket holding a folded throw or magazines.',

    'LIGHTING MOOD: bright, sheer, cool 5500K daylight pours through unadorned or',
    'gauze-curtained windows. Optional very subtle warm candle glow on a side table.',
    'The overall feeling is luminous, calm, and crisp — hygge but not heavy.',

    'AVOID: dark woods (walnut, mahogany, ebony), heavy ornate furniture, glossy',
    'surfaces, chrome, brass-heavy fixtures, maximalism, busy patterns, themed decor,',
    'tropical prints, anything that reads as "Australian beach house" rather than',
    'European Nordic.',
  ].join(' '),

  coastal: [
    'STAGING STYLE: COASTAL / HAMPTONS (Sydney northern beaches aesthetic, not',
    'cliché tropical).',

    'COLOUR PALETTE: crisp whites and warm off-whites. Sandy beige and oat. Soft seafoam',
    'and pale denim blue used sparingly. Weathered driftwood and whitewashed timber.',
    'Brushed brass or polished nickel hardware. Soft natural greens from plants. Avoid',
    'navy-and-white striped sailor cliché — keep it sophisticated and restrained.',

    'LIVING ROOM FURNITURE (use whichever apply): a deep slipcovered three-seat sofa in',
    'white or pale-blue washed linen with relaxed loose covers. A pair of rattan or cane',
    'armchairs with cream linen cushions. A whitewashed or driftwood-finish timber coffee',
    'table with a soft worn patina. A jute or natural sisal rug in oat. A large round',
    'mirror with a distressed white or driftwood frame above a console. A rope-detail',
    'or whitewashed timber floor lamp with a natural linen shade.',

    'BEDROOM FURNITURE (if bedroom): a queen or king bed with a soft linen-upholstered',
    'headboard in cream or pale seafoam. Layered white linen bedding with a chunky',
    'cable-knit cream throw and a single pale-blue or sea-foam accent cushion.',
    'Whitewashed timber bedside tables with simple ceramic lamps and linen shades. A',
    'piece of black-and-white ocean photography above the bed (no neon-blue tropical',
    'water — restrained, editorial).',

    'KITCHEN/DINING (if applicable): a whitewashed timber dining table with six chairs',
    'in matching whitewashed timber or natural rattan. A trio of woven rattan pendants',
    'above the table. A glass hurricane lantern with a chunky cream candle in the centre.',
    'A small ceramic bowl with fresh lemons.',

    'DECOR ACCENTS: a ceramic vase with eucalyptus or sea grasses. A glass hurricane',
    'lantern with a natural-coloured candle. A stack of large-format coffee-table books',
    'about ocean photography, architecture, or design — no kitschy beach-themed novels.',
    'A bowl of natural items (smooth river stones, weathered driftwood, sea-glass) on',
    'the coffee table. One large potted palm (kentia, or fiddle leaf) in a woven seagrass',
    'planter. A folded chunky linen throw casually placed on the sofa arm.',

    'LIGHTING MOOD: bright, airy, sun-bleached 5500K daylight pours through gauze or',
    'sheer linen curtains. The overall feel is breezy, fresh, and slightly aged — like',
    'a well-loved beach house that has been lived in for decades.',

    'AVOID: nautical kitsch (anchors, ship wheels, lifebuoys), neon blue / tropical',
    'turquoise saturation, fast-fashion beach signs, plastic palms, tiki anything,',
    'busy striped fabrics in primary blue and white, anything that screams "souvenir',
    'shop." This is high-end coastal, not theme-park.',
  ].join(' '),

  'mid-century': [
    'STAGING STYLE: MID-CENTURY MODERN (1950s-1960s Eames / Saarinen / Wegner era,',
    'as reinterpreted for a 2025 Melbourne or Sydney listing).',

    'COLOUR PALETTE: warm walnut and teak woods (the hero material). Tan and cognac',
    'leather. Mustard yellow, burnt orange, and avocado green as accent colours used',
    'in textiles or art. Deep teal or charcoal as a secondary accent. Brass fixtures',
    'and lamp bases — always brushed, never polished. Cream and warm-white walls.',

    'LIVING ROOM FURNITURE (use whichever apply): a low walnut-frame sofa with tapered',
    'peg legs and tan or cognac leather cushions in a Knoll or Florence design. A',
    'walnut sideboard or credenza with sliding doors and slim brass pulls. A matching',
    'walnut coffee table in an oval or rectangular shape with tapered legs. A',
    'sculptural brass arc floor lamp arching over the sofa. A pair of accent chairs in',
    'mustard wool or cognac leather (Eames-lounge-inspired but not a literal copy).',
    'A geometric tribal-pattern rug in rust, cream, and mustard, or a flatweave kilim',
    'in earth tones.',

    'BEDROOM FURNITURE (if bedroom): a low walnut platform bed with a slim walnut',
    'headboard. Cream or oat linen bedding with a mustard wool blanket folded at the',
    'foot. Two walnut bedside tables with tapered legs and a single brass-base lamp on',
    'each with a cream linen drum shade. A piece of abstract framed art above the bed',
    'in earth tones (rust, ochre, burnt orange).',

    'KITCHEN/DINING (if applicable): a Saarinen-style tulip dining table with a white',
    'top and brushed steel base, OR a walnut dining table with tapered legs. Four to',
    'six Wegner Wishbone or Eames moulded plywood chairs. A single large brass or',
    'enamelled pendant over the table. A ceramic bud vase with a single sculptural',
    'stem (a banksia or protea works well).',

    'DECOR ACCENTS: a brass bar cart with vintage glassware (cut crystal tumblers,',
    'a decanter with amber liquid). A piece of abstract framed art in earth tones',
    'above the sofa. A tall monstera deliciosa or fiddle-leaf fig in a tapered',
    'planter on hairpin legs. A stack of design and architecture books. A ceramic',
    'or brass ashtray as sculpture (do not show cigarettes). A turntable on the',
    'sideboard with a single LP propped against it.',

    'LIGHTING MOOD: choose ONE — either warm tungsten-tone (2700K) golden-hour evening',
    'glow that highlights the wood grain and leather, OR sharp 5500K afternoon daylight',
    'angled to cast crisp shadows on textured surfaces. Do not mix both moods.',

    'AVOID: literal vintage in poor condition, kitschy retro-diner aesthetics, harvest',
    'gold and avocado in cliché combinations, brown shag carpet, garish 1970s wallpaper,',
    'starburst clocks, fake plants, anything that reads "thrift store" instead of',
    '"curated mid-century revival."',
  ].join(' '),
};

/* ─────────────────────────────────────────────────────────────────────────
   PUBLIC API
   ─────────────────────────────────────────────────────────────────────── */
export function buildPrompt(service: ServiceId, style?: string): string {
  if (service === 'declutter') {
    return [
      BASE_REALISM,

      'TASK: DECLUTTER.',

      'Remove every removable personal item, paperwork, photo frame, family photograph,',
      'magazine, newspaper, junk mail, cable, charging station, power board, kitchen',
      'small-appliance clutter, toiletries on bathroom surfaces, rubbish bin, laundry,',
      'shoes by the door, jackets on chairs, mail on benchtops, keys, remotes, and any',
      'temporary or visually noisy item that wouldn\'t belong in a clean editorial',
      'listing photograph.',

      'Remove portable furniture ONLY when it is clearly excess or out of place — for',
      'example: a mismatched extra dining chair tucked in a corner, an ironing board',
      'leaning against a wall, a folded card table, a portable heater or fan mid-room,',
      'a baby gate stretched across an opening, a fold-out drying rack. Do NOT remove',
      'the main intended furniture (sofa, bed, dining table, primary chairs, side tables).',

      'PRESERVE EXACTLY: all built-in fixtures (kitchen cabinetry, range, hood, splashback,',
      'oven, fridge in place, fireplace mantle, built-in shelving, built-in wardrobes,',
      'all doors, all windows, all light fittings, ceiling fans, air vents, downlights,',
      'all flooring including tile/timber/carpet pattern, all wall paint colour, all',
      'skirting and architraves, all tap fixtures, all sanitary ware).',

      'PRESERVE EXACTLY: the natural lighting, exposure, white balance, shadows, and',
      'colour cast of the original HDR image. Do not relight the scene. Do not change',
      'the time of day. Do not change the camera position.',

      'The result should look like the SAME room professionally tidied for a real-estate',
      'listing shoot — not staged, not redesigned, not refurnished. A clean, honest',
      'representation of the space ready to photograph.',
    ].join(' ');
  }

  if (service === 'stage') {
    const styleKey = style && STAGE_PROMPTS[style] ? style : 'modern';
    return [
      BASE_REALISM,

      'TASK: VIRTUAL STAGING.',

      STAGE_PROMPTS[styleKey],

      'CRITICAL PHYSICAL CORRECTNESS RULES: every piece of furniture must sit physically',
      'flat on the original floor with realistic contact shadows and contact points.',
      'Furniture scale must match the room — measure visually against doors, windows,',
      'and ceiling height. No furniture clipping through walls, no objects floating in',
      'mid-air, no shadows pointing the wrong direction, no double shadows. The light',
      'source on staged furniture must match the existing light direction in the',
      'original photo.',

      'ARCHITECTURAL PRESERVATION: do NOT alter walls, ceilings, windows, doors,',
      'fixtures, flooring, paint colour, ceiling height, room layout, or camera',
      'perspective. The staging is added ON TOP OF the existing empty or sparsely-',
      'furnished room. The bones of the room must remain identical.',

      'NEVER include: a real estate agent\'s sign, an "auction" board, a sold sticker,',
      'price tags, brand logos on furniture, a TV showing a brand or content, any',
      'recognisable celebrity face, anything religious, anything political.',

      'The final result must be visually INDISTINGUISHABLE from a real photograph of',
      'a professionally staged room. A property buyer browsing on realestate.com.au',
      'should believe this furniture is physically in the room.',
    ].join(' ');
  }

  // dusk
  return [
    BASE_REALISM,

    'TASK: DAY-TO-DUSK CONVERSION.',

    'Convert the lighting from daytime to dusk/twilight, approximately 15-25 minutes',
    'AFTER sunset (the "blue hour" with residual warm horizon glow).',

    'SKY: gradient from a warm sunset orange and soft pink at the horizon, transitioning',
    'through pale lavender and dusty purple, to a deepening cobalt and indigo blue',
    'directly overhead. A few faint cirrus or stratus clouds catching the residual sun,',
    'gilded in soft gold and pink along their lower edges. The sky should look like a',
    'real Australian late-summer evening — not exaggerated, not over-saturated.',

    'INTERIOR LIGHTING: every visible interior lamp, pendant, downlight, wall sconce,',
    'and feature light is switched ON and emitting a warm 2700K-3000K glow. Light',
    'spills out through windows creating soft pools of warm light on interior surfaces',
    'and on the ground or paving just outside. Where applicable, faint silhouettes of',
    'furniture are visible through curtains as warm shapes.',

    'EXTERIOR LIGHTING (if facade visible): a subtle warm ambient glow on the building',
    'facade where natural light would still hit. Landscape lights, garden path lights,',
    'or under-eave downlights are switched on as warm pinpoints. The pool (if present)',
    'shows underwater lighting if it has it. No streetlights unless they were already',
    'visible in the source image.',

    'SHADOWS AND REFLECTIONS: all shadows must match the new low-angle late-evening',
    'light direction. Reflections in glass, water, and polished floors must show the',
    'new warm-cool sky gradient correctly. Do not leave shadows from the original',
    'daytime sun direction.',

    'PRESERVE EXACTLY: all architecture, geometry, composition, camera position,',
    'lens choice, framing, aspect ratio, and the placement of every fixed element',
    '(windows, doors, fixtures, landscaping, furniture). Only the lighting and sky',
    'change. The image must feel like the same A7R V tripod-locked shot taken six',
    'hours later — not a different composition.',
  ].join(' ');
}
