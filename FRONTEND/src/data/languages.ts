export interface LanguageItem {
  id: string;
  name: string;
  flag: string;
}

export const COURSE_LANGUAGES: LanguageItem[] = [
  { id: "english", name: "ENGLISH", flag: "bbe17e16aa4a106032d8e3521eaed13e.svg" },
  { id: "chess", name: "CHESS", flag: "c8bad7c09aaf7bc29ddddc50808adb54.svg" },
  { id: "math", name: "MATH", flag: "395c8a6ee9783610b578b02fda405e85.svg" },
  { id: "spanish", name: "SPANISH", flag: "59a90a2cedd48b751a8fd22014768fd7.svg" },
  { id: "french", name: "FRENCH", flag: "482fda142ee4abd728ebf4ccce5d3307.svg" },
  { id: "german", name: "GERMAN", flag: "c71db846ffab7e0a74bc6971e34ad82e.svg" },
  { id: "italian", name: "ITALIAN", flag: "635a09df9323279d39934a991edd4510.svg" },
  { id: "portuguese", name: "PORTUGUESE", flag: "27d253ae1272917fc9f4a79459aacd53.svg" },
  { id: "dutch", name: "DUTCH", flag: "de945d789e249dcd74333a6996472ef8.svg" },
  { id: "japanese", name: "JAPANESE", flag: "edea4fa18ff3e7d8c0282de3f102aaed.svg" },
  { id: "arabic", name: "ARABIC", flag: "9ab6930a263c981b57f9d578ac97cae7.svg" },
  { id: "czech", name: "CZECH", flag: "828bf0fea457d3beaaab3d6c0bfcc975.svg" },
  { id: "welsh", name: "WELSH", flag: "f773f1b240623072e48843ecdf90d756.svg" },
  { id: "danish", name: "DANISH", flag: "6af84a7cb8e99ea8a567c2b9c55b9926.svg" },
  { id: "greek", name: "GREEK", flag: "8db373482261397a3159d3f370eed2f3.svg" },
  { id: "esperanto", name: "ESPERANTO", flag: "6de7e4731b2a82a6458268e1a3d67ce4.svg" },
  { id: "finnish", name: "FINNISH", flag: "b4d0e4f6451f504e1441eb93efdbea5e.svg" },
  { id: "irish", name: "IRISH", flag: "ef0bfb96037b127473bd7bcbfde1a6ed.svg" },
  { id: "scottish-gaelic", name: "SCOTTISH GAELIC", flag: "09eba3135efe8fe93a4662dba813b921.svg" },
  { id: "hebrew", name: "HEBREW", flag: "f818f545a703ddaa046ca8786e781742.svg" },
  { id: "hindi", name: "HINDI", flag: "73837fa39dbf1bcc4c95a17a58ed0ffb.svg" },
  { id: "haitian-creole", name: "HAITIAN CREOLE", flag: "8cb302b44c183c1a8ec3b90caf90d922.svg" },
  { id: "hungarian", name: "HUNGARIAN", flag: "2ed8d0a73eab3c9cba0290e2b459684a.svg" },
  { id: "high-valyrian", name: "HIGH VALYRIAN", flag: "2880099b038848abbfd11104097953ad.svg" },
  { id: "hawaiian", name: "HAWAIIAN", flag: "312e21f793c555787d01a45e20ee8191.svg" },
  { id: "indonesian", name: "INDONESIAN", flag: "339c0413e542f19b234971d7740447e7.svg" },
  { id: "korean", name: "KOREAN", flag: "ec5835ac9f465ff3dad4b1b8725d4314.svg" },
  { id: "latin", name: "LATIN", flag: "f7cee6cc09270371b097129faf792c2a.svg" },
  { id: "norwegian", name: "NORWEGIAN", flag: "90b37d97edc66e830dc2286279548f67.svg" },
  { id: "navajo", name: "NAVAJO", flag: "bbc8ad0cfe2596d5193376ebdc3e969c.svg" },
  { id: "polish", name: "POLISH", flag: "f095084e6ec400e631d62c3d95fefaa2.svg" },
  { id: "romanian", name: "ROMANIAN", flag: "357e13bb10cf86fc06552d563957e2e6.svg" },
  { id: "russian", name: "RUSSIAN", flag: "eadd7804652170c33814a89482f1f353.svg" },
  { id: "swedish", name: "SWEDISH", flag: "f578430c9b7ab617c107893afbb501c0.svg" },
  { id: "swahili", name: "SWAHILI", flag: "335311988405b4354e1b6ae9037c02db.svg" },
  { id: "klingon", name: "KLINGON", flag: "76d654213a8282b0ebc25b4f535ee003.svg" },
  { id: "turkish", name: "TURKISH", flag: "bc80a9518cd6d5af6ae14e8b22b8a1f4.svg" },
  { id: "ukrainian", name: "UKRAINIAN", flag: "7c6e12bc57527843082f7f5bb77c9862.svg" },
  { id: "vietnamese", name: "VIETNAMESE", flag: "2b077d42185bc45d4896ed55f15c4fea.svg" },
  { id: "yiddish", name: "YIDDISH", flag: "55bad151fa6a8d9e2376fc9697c671c8.svg" },
  { id: "chinese", name: "CHINESE", flag: "9905aa3a86fcb9e351b0b3bfaf04d8b9.svg" },
  { id: "zulu", name: "ZULU", flag: "112e1531d0ac198a9424bd1b0a7166e6.svg" },
];

export interface LearnCourseItem {
  id: string;
  name: string;
  flag: string;
  learners: string;
}

/** Courses shown on the Get Started / learn picker page. */
export const LEARN_COURSES: LearnCourseItem[] = [
  {
    id: "japanese",
    name: "Japanese",
    flag: "edea4fa18ff3e7d8c0282de3f102aaed.svg",
    learners: "18.2M learners",
  },
];

export interface SiteLanguageItem {
  id: string;
  label: string;
  shortLabel: string;
  viewBox: string;
}

/** Two-column dropdown order: left column first, then right column. */
export const SITE_LANGUAGE_OPTIONS: SiteLanguageItem[] = [
  { id: "ar", label: "العربية", shortLabel: "Arabic", viewBox: "0 2178 82 66" },
  { id: "cs", label: "Čeština", shortLabel: "Czech", viewBox: "0 1848 82 66" },
  { id: "el", label: "Ελληνικά", shortLabel: "Greek", viewBox: "0 924 82 66" },
  { id: "es", label: "Español", shortLabel: "Spanish", viewBox: "0 66 82 66" },
  { id: "hi", label: "हिंदी", shortLabel: "Hindi", viewBox: "0 1914 82 66" },
  { id: "id", label: "Bahasa Indonesia", shortLabel: "Indonesian", viewBox: "0 1980 82 66" },
  { id: "ja", label: "日本語", shortLabel: "Japanese", viewBox: "0 264 82 66" },
  { id: "nl-NL", label: "Nederlands", shortLabel: "Dutch", viewBox: "0 726 82 66" },
  { id: "pl", label: "Polski", shortLabel: "Polish", viewBox: "0 1056 82 66" },
  { id: "ro", label: "Română", shortLabel: "Romanian", viewBox: "0 1386 82 66" },
  { id: "sv", label: "svenska", shortLabel: "Swedish", viewBox: "0 792 82 66" },
  { id: "te", label: "తెలుగు", shortLabel: "Telugu", viewBox: "0 1914 82 66" },
  { id: "tl", label: "Tagalog", shortLabel: "Tagalog", viewBox: "0 3036 82 66" },
  { id: "uk", label: "Українською", shortLabel: "Ukrainian", viewBox: "0 1716 82 66" },
  { id: "vi", label: "Tiếng Việt", shortLabel: "Vietnamese", viewBox: "0 1188 82 66" },
  { id: "bn", label: "বাংলা", shortLabel: "Bengali", viewBox: "0 1914 82 66" },
  { id: "de", label: "Deutsch", shortLabel: "German", viewBox: "0 198 82 66" },
  { id: "en", label: "English", shortLabel: "English", viewBox: "0 0 82 66" },
  { id: "fr", label: "Français", shortLabel: "French", viewBox: "0 132 82 66" },
  { id: "hu", label: "Magyar", shortLabel: "Hungarian", viewBox: "0 1584 82 66" },
  { id: "it", label: "Italiano", shortLabel: "Italian", viewBox: "0 330 82 66" },
  { id: "ko", label: "한국어", shortLabel: "Korean", viewBox: "0 396 82 66" },
  { id: "pa", label: "ਪੰਜਾਬੀ", shortLabel: "Punjabi", viewBox: "0 1914 82 66" },
  { id: "pt", label: "Português", shortLabel: "Portuguese", viewBox: "0 594 82 66" },
  { id: "ru", label: "Русский", shortLabel: "Russian", viewBox: "0 528 82 66" },
  { id: "ta", label: "தமிழ்", shortLabel: "Tamil", viewBox: "0 1914 82 66" },
  { id: "th", label: "ภาษาไทย", shortLabel: "Thai", viewBox: "0 2310 82 66" },
  { id: "tr", label: "Türkçe", shortLabel: "Turkish", viewBox: "0 660 82 66" },
  { id: "ur", label: "اُردُو", shortLabel: "Urdu", viewBox: "0 3168 82 66" },
  { id: "zh", label: "中文", shortLabel: "Chinese", viewBox: "0 462 82 66" },
];

export const SITE_LANGUAGES = [
  "English",
  "Español",
  "Français",
  "Deutsch",
  "Italiano",
  "Português",
  "Русский",
  "Türkçe",
  "日本語",
  "한국어",
  "中文",
  "العربية",
  "हिन्दी",
  "Indonesia",
  "Polski",
  "Nederlands",
  "Svenska",
  "Norsk",
  "Dansk",
  "Suomi",
  "Čeština",
  "Ελληνικά",
  "Magyar",
  "Română",
  "Українська",
  "Tiếng Việt",
  "ไทย",
  "עברית",
  "فارسی",
  "বাংলা",
];
