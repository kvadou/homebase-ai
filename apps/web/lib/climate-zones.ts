export interface ClimateZone {
  zone: number;
  description: string;
  winterSeverity: "mild" | "moderate" | "severe";
  summerSeverity: "mild" | "moderate" | "severe";
}

export interface SeasonalTask {
  title: string;
  description: string;
  season: "spring" | "summer" | "fall" | "winter";
  climateZones: number[];
  priority: "low" | "medium" | "high";
}

// Mapping of first 3 digits of zip code to IECC climate zones
// Simplified but covers all US regions
const ZIP_PREFIX_TO_ZONE: Record<string, number> = {
  // Zone 1 - Very Hot/Humid: South Florida, Hawaii, US territories
  "330": 1, "331": 1, "332": 1, "333": 1, "334": 1,
  "335": 1, "338": 1, "339": 1, "341": 1,
  "967": 1, "968": 1, // Hawaii
  // Zone 2 - Hot/Humid: Texas Gulf, South Florida, SoCal coast
  "336": 2, "337": 2, "340": 2, "342": 2,
  "346": 2, "347": 2, "348": 2,
  "770": 2, "772": 2, "773": 2, "774": 2, "775": 2,
  "776": 2, "777": 2, "778": 2, "779": 2, "780": 2,
  "785": 2, "786": 2, "787": 2, "788": 2, "789": 2,
  "900": 2, "901": 2, "902": 2, "903": 2, "904": 2,
  "905": 2, "906": 2, "907": 2, "908": 2, "910": 2,
  "911": 2, "912": 2, "913": 2, "914": 2, "915": 2,
  "916": 2, "917": 2, "918": 2,
  "700": 2, "701": 2, "703": 2, "704": 2, "705": 2,
  // Zone 3 - Warm: Southeast, Central Texas, Arizona
  "300": 3, "301": 3, "302": 3, "303": 3, "304": 3,
  "305": 3, "306": 3, "307": 3, "308": 3, "309": 3,
  "310": 3, "311": 3, "312": 3, "313": 3, "314": 3,
  "315": 3, "316": 3, "317": 3, "318": 3, "319": 3,
  "350": 3, "351": 3, "352": 3, "354": 3, "355": 3, "356": 3,
  "357": 3, "358": 3, "359": 3, "360": 3, "361": 3, "362": 3,
  "363": 3, "364": 3, "365": 3, "366": 3,
  "370": 3, "371": 3, "372": 3, "373": 3, "374": 3, "376": 3,
  "377": 3, "378": 3, "379": 3, "380": 3, "381": 3, "382": 3, "383": 3, "384": 3, "385": 3, "386": 3,
  "387": 3, "388": 3, "389": 3, "390": 3, "391": 3, "392": 3, "393": 3, "394": 3, "395": 3, "396": 3, "397": 3,
  "706": 3, "707": 3, "708": 3, "710": 3, "711": 3, "712": 3,
  "713": 3, "714": 3,
  "750": 3, "751": 3, "752": 3, "753": 3, "754": 3,
  "755": 3, "756": 3, "757": 3, "758": 3, "759": 3,
  "760": 3, "761": 3, "762": 3, "763": 3, "764": 3, "765": 3,
  "850": 3, "852": 3, "853": 3, "855": 3, "856": 3, "857": 3,
  "270": 3, "271": 3, "272": 3, "273": 3, "274": 3,
  "275": 3, "276": 3, "277": 3, "278": 3, "279": 3,
  "280": 3, "281": 3, "282": 3, "283": 3, "284": 3, "285": 3,
  "286": 3, "287": 3, "288": 3, "289": 3, "290": 3,
  "291": 3, "292": 3, "293": 3, "294": 3, "295": 3, "296": 3, "297": 3, "298": 3, "299": 3,
  // Zone 4 - Mixed: Mid-Atlantic, Midwest, Northern CA
  "200": 4, "201": 4, "202": 4, "203": 4, "204": 4, "205": 4, "206": 4, "207": 4, "208": 4, "209": 4,
  "210": 4, "211": 4, "212": 4, "214": 4, "215": 4, "216": 4, "217": 4, "218": 4, "219": 4,
  "220": 4, "221": 4, "222": 4, "223": 4, "224": 4, "225": 4, "226": 4, "227": 4, "228": 4, "229": 4,
  "230": 4, "231": 4, "232": 4, "233": 4, "234": 4, "235": 4, "236": 4, "237": 4, "238": 4, "239": 4,
  "240": 4, "241": 4, "242": 4, "243": 4, "244": 4, "245": 4, "246": 4,
  "247": 4, "248": 4, "249": 4, "250": 4, "251": 4, "252": 4, "253": 4, "254": 4, "255": 4, "256": 4,
  "257": 4, "258": 4, "259": 4, "260": 4, "261": 4, "262": 4, "263": 4, "264": 4, "265": 4, "266": 4, "267": 4, "268": 4,
  "400": 4, "401": 4, "402": 4, "403": 4, "404": 4, "405": 4,
  "406": 4, "407": 4, "408": 4, "409": 4, "410": 4, "411": 4,
  "412": 4, "413": 4, "414": 4, "415": 4, "416": 4, "417": 4, "418": 4,
  "630": 4, "631": 4, "633": 4, "634": 4, "635": 4, "636": 4,
  "637": 4, "638": 4, "639": 4,
  "640": 4, "641": 4,
  "920": 4, "921": 4, "922": 4, "923": 4, "924": 4, "925": 4,
  "926": 4, "927": 4, "928": 4,
  "930": 4, "931": 4, "932": 4, "933": 4, "934": 4, "935": 4,
  "936": 4, "937": 4, "938": 4, "939": 4,
  "940": 4, "941": 4, "942": 4, "943": 4, "944": 4, "945": 4,
  "946": 4, "947": 4, "948": 4, "949": 4, "950": 4, "951": 4,
  "952": 4, "953": 4, "954": 4, "955": 4, "956": 4, "957": 4, "958": 4, "959": 4, "960": 4, "961": 4,
  // Zone 5 - Cool: Northern Midwest, Northeast, Mountain states
  "100": 5, "101": 5, "102": 5, "103": 5, "104": 5, "105": 5, "106": 5, "107": 5, "108": 5, "109": 5,
  "110": 5, "111": 5, "112": 5, "113": 5, "114": 5, "115": 5, "116": 5, "117": 5, "118": 5, "119": 5,
  "120": 5, "121": 5, "122": 5, "123": 5, "124": 5, "125": 5, "126": 5, "127": 5, "128": 5, "129": 5,
  "130": 5, "131": 5, "132": 5, "133": 5, "134": 5, "135": 5, "136": 5, "137": 5, "138": 5, "139": 5,
  "140": 5, "141": 5, "142": 5, "143": 5, "144": 5, "145": 5, "146": 5, "147": 5, "148": 5, "149": 5,
  "150": 5, "151": 5, "152": 5, "153": 5, "154": 5, "155": 5, "156": 5, "157": 5, "158": 5, "159": 5,
  "160": 5, "161": 5, "162": 5, "163": 5, "164": 5, "165": 5, "166": 5, "167": 5, "168": 5, "169": 5,
  "170": 5, "171": 5, "172": 5, "173": 5, "174": 5, "175": 5, "176": 5, "177": 5, "178": 5, "179": 5,
  "180": 5, "181": 5, "182": 5, "183": 5, "184": 5, "185": 5, "186": 5, "187": 5, "188": 5, "189": 5,
  "190": 5, "191": 5,
  "010": 5, "011": 5, "012": 5, "013": 5, "014": 5, "015": 5, "016": 5, "017": 5, "018": 5, "019": 5,
  "020": 5, "021": 5, "022": 5, "023": 5, "024": 5, "025": 5, "026": 5, "027": 5,
  "060": 5, "061": 5, "062": 5, "063": 5, "064": 5, "065": 5, "066": 5, "067": 5, "068": 5, "069": 5,
  "028": 5, "029": 5,
  "430": 5, "431": 5, "432": 5, "433": 5, "434": 5, "435": 5, "436": 5, "437": 5, "438": 5, "439": 5,
  "440": 5, "441": 5, "442": 5, "443": 5, "444": 5, "445": 5, "446": 5, "447": 5, "448": 5, "449": 5,
  "450": 5, "451": 5, "452": 5, "453": 5, "454": 5, "455": 5, "456": 5, "457": 5, "458": 5,
  "460": 5, "461": 5, "462": 5, "463": 5, "464": 5, "465": 5, "466": 5, "467": 5, "468": 5, "469": 5,
  "470": 5, "471": 5, "472": 5, "473": 5, "474": 5, "475": 5, "476": 5, "477": 5, "478": 5, "479": 5,
  "600": 5, "601": 5, "602": 5, "603": 5, "604": 5, "605": 5, "606": 5, "607": 5, "608": 5, "609": 5,
  "610": 5, "611": 5, "612": 5, "613": 5, "614": 5, "615": 5, "616": 5, "617": 5, "618": 5, "619": 5,
  "620": 5, "622": 5, "623": 5, "624": 5, "625": 5, "626": 5, "627": 5, "628": 5, "629": 5,
  "800": 5, "801": 5, "802": 5, "803": 5, "804": 5, "805": 5, "806": 5, "807": 5, "808": 5, "809": 5, "810": 5, "811": 5, "812": 5, "813": 5, "814": 5, "815": 5, "816": 5,
  "970": 5, "971": 5, "972": 5, "973": 5, "974": 5, "975": 5, "976": 5, "977": 5, "978": 5, "979": 5,
  "980": 5, "981": 5, "982": 5, "983": 5, "984": 5, "985": 5, "986": 5,
  // Zone 6 - Cold: Upper Midwest, New England, Mountain
  "030": 6, "031": 6, "032": 6, "033": 6, "034": 6, "035": 6, "036": 6, "037": 6, "038": 6, "039": 6,
  "040": 6, "041": 6, "042": 6, "043": 6, "044": 6, "045": 6, "046": 6, "047": 6, "048": 6, "049": 6,
  "050": 6, "051": 6, "052": 6, "053": 6, "054": 6, "056": 6, "057": 6, "058": 6, "059": 6,
  "480": 6, "481": 6, "482": 6, "483": 6, "484": 6, "485": 6, "486": 6, "487": 6, "488": 6, "489": 6,
  "490": 6, "491": 6, "492": 6, "493": 6, "494": 6, "495": 6, "496": 6, "497": 6, "498": 6, "499": 6,
  "530": 6, "531": 6, "532": 6, "534": 6, "535": 6, "537": 6, "538": 6, "539": 6,
  "540": 6, "541": 6, "542": 6, "543": 6, "544": 6, "545": 6, "546": 6, "547": 6, "548": 6, "549": 6,
  "500": 6, "501": 6, "502": 6, "503": 6, "504": 6, "505": 6, "506": 6, "507": 6, "508": 6, "509": 6,
  "510": 6, "511": 6, "512": 6, "513": 6, "514": 6, "515": 6, "516": 6, "520": 6, "521": 6, "522": 6,
  "523": 6, "524": 6, "525": 6, "526": 6, "527": 6, "528": 6,
  "820": 6, "821": 6, "822": 6, "823": 6, "824": 6, "825": 6, "826": 6, "827": 6, "828": 6, "829": 6, "830": 6, "831": 6, "832": 6, "833": 6, "834": 6, "835": 6, "836": 6, "837": 6, "838": 6,
  "590": 6, "591": 6, "592": 6, "593": 6, "594": 6, "595": 6, "596": 6, "597": 6, "598": 6, "599": 6,
  "987": 6, "988": 6, "989": 6, "990": 6, "991": 6, "992": 6, "993": 6, "994": 6,
  // Zone 7 - Very Cold: Minnesota, North Dakota, Montana
  "550": 7, "551": 7, "553": 7, "554": 7, "555": 7, "556": 7, "557": 7, "558": 7, "559": 7,
  "560": 7, "561": 7, "562": 7, "563": 7, "564": 7, "565": 7, "566": 7, "567": 7,
  "570": 7, "571": 7, "572": 7, "573": 7, "574": 7, "575": 7, "576": 7, "577": 7,
  "580": 7, "581": 7, "582": 7, "583": 7, "584": 7, "585": 7, "586": 7, "587": 7, "588": 7,
  // Zone 8 - Subarctic: Alaska
  "995": 8, "996": 8, "997": 8, "998": 8, "999": 8,
};

const CLIMATE_ZONES: Record<number, ClimateZone> = {
  1: { zone: 1, description: "Very Hot-Humid (South Florida, Hawaii)", winterSeverity: "mild", summerSeverity: "severe" },
  2: { zone: 2, description: "Hot-Humid (Gulf Coast, Southern CA)", winterSeverity: "mild", summerSeverity: "severe" },
  3: { zone: 3, description: "Warm-Humid (Southeast, Central TX)", winterSeverity: "mild", summerSeverity: "moderate" },
  4: { zone: 4, description: "Mixed-Humid (Mid-Atlantic, Midwest)", winterSeverity: "moderate", summerSeverity: "moderate" },
  5: { zone: 5, description: "Cool-Humid (Northeast, Upper Midwest)", winterSeverity: "moderate", summerSeverity: "mild" },
  6: { zone: 6, description: "Cold (Northern US, Mountains)", winterSeverity: "severe", summerSeverity: "mild" },
  7: { zone: 7, description: "Very Cold (Minnesota, Dakotas)", winterSeverity: "severe", summerSeverity: "mild" },
  8: { zone: 8, description: "Subarctic (Alaska)", winterSeverity: "severe", summerSeverity: "mild" },
};

export function getClimateZone(zipCode: string): ClimateZone {
  const prefix = zipCode.substring(0, 3);
  const zone = ZIP_PREFIX_TO_ZONE[prefix] ?? 4; // Default to zone 4 (mixed)
  return CLIMATE_ZONES[zone]!;
}

export function getCurrentSeason(): "spring" | "summer" | "fall" | "winter" {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

export function getNextSeason(season: "spring" | "summer" | "fall" | "winter"): "spring" | "summer" | "fall" | "winter" {
  const order: Array<"spring" | "summer" | "fall" | "winter"> = ["spring", "summer", "fall", "winter"];
  const idx = order.indexOf(season);
  return order[(idx + 1) % 4];
}

const ALL_SEASONAL_TASKS: SeasonalTask[] = [
  // SPRING tasks
  {
    title: "Inspect roof for winter damage",
    description: "Check for missing/damaged shingles, flashing, and signs of leaks after winter weather.",
    season: "spring",
    climateZones: [3, 4, 5, 6, 7, 8],
    priority: "high",
  },
  {
    title: "Clean gutters and downspouts",
    description: "Remove debris accumulated over winter. Ensure water flows freely away from foundation.",
    season: "spring",
    climateZones: [1, 2, 3, 4, 5, 6, 7, 8],
    priority: "high",
  },
  {
    title: "Service air conditioning system",
    description: "Replace filters, clean coils, check refrigerant levels before hot weather.",
    season: "spring",
    climateZones: [1, 2, 3, 4, 5, 6, 7],
    priority: "high",
  },
  {
    title: "Inspect exterior caulking and weatherstripping",
    description: "Check around windows, doors, and utility penetrations. Re-seal as needed.",
    season: "spring",
    climateZones: [1, 2, 3, 4, 5, 6, 7, 8],
    priority: "medium",
  },
  {
    title: "Test sprinkler system",
    description: "Turn on irrigation, check for broken heads and leaks, adjust coverage.",
    season: "spring",
    climateZones: [2, 3, 4, 5, 6, 7],
    priority: "medium",
  },
  {
    title: "Power wash exterior surfaces",
    description: "Clean siding, deck, patio, and driveway to remove winter grime and mildew.",
    season: "spring",
    climateZones: [1, 2, 3, 4, 5, 6, 7],
    priority: "low",
  },
  {
    title: "Check foundation for cracks",
    description: "Inspect foundation walls for new cracks caused by freeze-thaw cycles.",
    season: "spring",
    climateZones: [4, 5, 6, 7, 8],
    priority: "high",
  },
  // SUMMER tasks
  {
    title: "Inspect and clean dryer vent",
    description: "Remove lint buildup to prevent fire hazard and improve efficiency.",
    season: "summer",
    climateZones: [1, 2, 3, 4, 5, 6, 7, 8],
    priority: "high",
  },
  {
    title: "Check and treat for termites",
    description: "Inspect wood structures for termite activity. Schedule professional treatment if needed.",
    season: "summer",
    climateZones: [1, 2, 3, 4],
    priority: "high",
  },
  {
    title: "Inspect deck and patio for damage",
    description: "Check for loose boards, rotting wood, and re-stain/seal if needed.",
    season: "summer",
    climateZones: [1, 2, 3, 4, 5, 6, 7],
    priority: "medium",
  },
  {
    title: "Check attic ventilation",
    description: "Ensure proper airflow to prevent heat buildup and moisture problems.",
    season: "summer",
    climateZones: [1, 2, 3, 4, 5],
    priority: "medium",
  },
  {
    title: "Inspect and repair window screens",
    description: "Fix or replace torn screens to keep insects out during warm months.",
    season: "summer",
    climateZones: [1, 2, 3, 4, 5, 6, 7],
    priority: "low",
  },
  {
    title: "Test and maintain sump pump",
    description: "Run sump pump test cycle and clean pit. Critical for summer storm season.",
    season: "summer",
    climateZones: [4, 5, 6, 7],
    priority: "high",
  },
  {
    title: "Service pool equipment",
    description: "Check pump, filter, and chemical balance. Inspect pool surfaces.",
    season: "summer",
    climateZones: [1, 2, 3, 4],
    priority: "medium",
  },
  // FALL tasks
  {
    title: "Service heating system",
    description: "Schedule furnace/boiler inspection, replace filters, test thermostat.",
    season: "fall",
    climateZones: [3, 4, 5, 6, 7, 8],
    priority: "high",
  },
  {
    title: "Clean and inspect chimney",
    description: "Have chimney swept and inspected for creosote buildup and structural issues.",
    season: "fall",
    climateZones: [4, 5, 6, 7, 8],
    priority: "high",
  },
  {
    title: "Winterize outdoor faucets and irrigation",
    description: "Drain and shut off outdoor water lines to prevent freeze damage.",
    season: "fall",
    climateZones: [4, 5, 6, 7, 8],
    priority: "high",
  },
  {
    title: "Clean gutters after leaf fall",
    description: "Remove leaves and debris before winter. Install gutter guards if not present.",
    season: "fall",
    climateZones: [3, 4, 5, 6, 7],
    priority: "high",
  },
  {
    title: "Seal driveway and walkways",
    description: "Apply sealant to asphalt driveways and fill concrete cracks before freeze season.",
    season: "fall",
    climateZones: [4, 5, 6, 7, 8],
    priority: "medium",
  },
  {
    title: "Inspect and add attic insulation",
    description: "Check insulation depth and add more if below recommended R-value for your zone.",
    season: "fall",
    climateZones: [5, 6, 7, 8],
    priority: "medium",
  },
  {
    title: "Test smoke and CO detectors",
    description: "Replace batteries and test all detectors before heating season begins.",
    season: "fall",
    climateZones: [1, 2, 3, 4, 5, 6, 7, 8],
    priority: "high",
  },
  {
    title: "Prepare hurricane shutters/supplies",
    description: "Inspect storm shutters, stock emergency supplies for hurricane season.",
    season: "fall",
    climateZones: [1, 2, 3],
    priority: "high",
  },
  // WINTER tasks
  {
    title: "Check for ice dams",
    description: "Monitor roof edges for ice dams after snowfall. Address insulation issues if recurring.",
    season: "winter",
    climateZones: [5, 6, 7, 8],
    priority: "high",
  },
  {
    title: "Monitor indoor humidity",
    description: "Keep indoor humidity 30-50% to prevent condensation, mold, and wood damage.",
    season: "winter",
    climateZones: [4, 5, 6, 7, 8],
    priority: "medium",
  },
  {
    title: "Inspect plumbing for frozen pipes",
    description: "Check exposed pipes in unheated areas. Insulate as needed during cold snaps.",
    season: "winter",
    climateZones: [5, 6, 7, 8],
    priority: "high",
  },
  {
    title: "Reverse ceiling fan direction",
    description: "Set fans to clockwise (winter mode) to push warm air down from ceiling.",
    season: "winter",
    climateZones: [3, 4, 5, 6, 7, 8],
    priority: "low",
  },
  {
    title: "Check water heater anode rod",
    description: "Inspect sacrificial anode rod and replace if heavily corroded. Extends tank life.",
    season: "winter",
    climateZones: [1, 2, 3, 4, 5, 6, 7, 8],
    priority: "medium",
  },
  {
    title: "Inspect weather stripping on doors",
    description: "Replace worn weather stripping to prevent heat loss and drafts.",
    season: "winter",
    climateZones: [4, 5, 6, 7, 8],
    priority: "medium",
  },
  {
    title: "Test generator and stock fuel",
    description: "Run backup generator, check fuel levels, and stock supplies for winter storms.",
    season: "winter",
    climateZones: [5, 6, 7, 8],
    priority: "medium",
  },
  {
    title: "Protect outdoor furniture",
    description: "Cover or store patio furniture and grills to protect from winter elements.",
    season: "winter",
    climateZones: [4, 5, 6, 7, 8],
    priority: "low",
  },
];

export function getSeasonalTasks(zone: number): SeasonalTask[] {
  return ALL_SEASONAL_TASKS.filter((task) => task.climateZones.includes(zone));
}

export function getSeasonalTasksForSeason(zone: number, season: "spring" | "summer" | "fall" | "winter"): SeasonalTask[] {
  return ALL_SEASONAL_TASKS.filter(
    (task) => task.season === season && task.climateZones.includes(zone)
  );
}
