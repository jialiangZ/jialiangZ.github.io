// Single source of truth for site + author config (was _config.yml / _data/navigation.yml)
export const SITE = {
  title: "Jialiang Zhang",
  url: "https://jialiangz.github.io",
  ogImage: "https://jialiangz.github.io/images/og-card.png",
  description:
    "Ph.D. student at HKU. AI for climate science, Arctic sea ice prediction, scientific forecasting, and streaming multimodal models.",
  scholarData: "data/scholar-stats/gs_data.json",
};

export const AUTHOR = {
  name: "Jialiang Zhang",
  avatar: "images/avatar.webp",
  bio: "Ph.D. student, The University of Hong Kong",
  location: "Hong Kong, China",
  email: "zhangjia_liang@foxmail.com",
  github: "jialiangZ",
  googlescholar: "https://scholar.google.com/citations?user=zk2uLXoAAAAJ",
  researchgate: "https://www.researchgate.net/profile/Jialiang-Zhang-22",
  orcid: "https://orcid.org/0009-0009-2047-3693",
};

export const NAVIGATION = [
  { title: "About Me", url: "/#about-me" },
  { title: "News", url: "/#-news" },
  { title: "Publications", url: "/#-publications" },
  { title: "Honors and Awards", url: "/#-honors-and-awards" },
  { title: "Educations", url: "/#-educations" },
  { title: "Visitor Map", url: "/#-visitor-map" },
];

export const PAPERS = [
  {
    image: "images/papers/tays.webp",
    imageAlt: "Think-as-You-See",
    imageWidth: 800,
    imageHeight: 451,
    title: "Think-as-You-See: Streaming Chain-of-Thought Reasoning for Large Vision-Language Models",
    arxiv: "https://arxiv.org/abs/2603.02872",
    venue: "CVPR, 2026",
    authors: "Jialiang Zhang, Junlong Tong, Junyan Lin, Hao Wu, Yirong Sun, Yunpu Ma, Xiaoyu Shen",
    selfHighlight: "Jialiang Zhang",
    scholarId: "zk2uLXoAAAAJ:UeHWp8X0CEIC",
    scholarTitle: "Think-as-You-See: Streaming Chain-of-Thought Reasoning for Large Vision-Language Models",
  },
  {
    image: "images/papers/utptrack.webp",
    imageAlt: "UTPTrack",
    imageWidth: 800,
    imageHeight: 398,
    title: "UTPTrack: Towards Simple and Unified Token Pruning for Visual Tracking",
    arxiv: "https://arxiv.org/abs/2602.23734v1",
    venue: "CVPR, 2026",
    authors: "Hao Wu, Xudong Wang, Jialiang Zhang, Junlong Tong, Xinghao Chen, Junyan Lin, Yunpu Ma, Xiaoyu Shen",
    selfHighlight: "Jialiang Zhang",
    scholarId: "zk2uLXoAAAAJ:IjCSPb-OGe4C",
    scholarTitle: "UTPTrack: Towards Simple and Unified Token Pruning for Visual Tracking",
  },
  {
    image: "images/papers/pdpm.webp",
    imageAlt: "PDPM",
    imageWidth: 800,
    imageHeight: 516,
    title: "Probing the Difficulty Perception Mechanism of Large Language Models",
    arxiv: "https://arxiv.org/abs/2510.05969",
    venue: "arXiv Preprint",
    authors: "Sunbowen Lee, Qingyu Yin, Chak Tou Leong, Jialiang Zhang, Yicheng Gong, Xiaoyu Shen",
    selfHighlight: "Jialiang Zhang",
    scholarId: "zk2uLXoAAAAJ:zYLM7Y9cAGgC",
    scholarTitle: "Probing the Difficulty Perception Mechanism of Large Language Models",
  },
  {
    image: "images/papers/sicfn.webp",
    imageAlt: "SICFN",
    imageWidth: 800,
    imageHeight: 510,
    title: "Frequency-Compensated Network for Daily Arctic Sea Ice Concentration Prediction",
    arxiv: "https://arxiv.org/abs/2504.16745",
    venue: "IEEE Transactions on Geoscience and Remote Sensing (TGRS), 2025",
    authors: "Jialiang Zhang, Feng Gao, Yanhai Gan, Junyu Dong, Qian Du",
    selfHighlight: "Jialiang Zhang",
    scholarId: "zk2uLXoAAAAJ:qjMakFHDy7sC",
    scholarTitle: "Frequency-Compensated Network for Daily Arctic Sea Ice Concentration Prediction",
  },
];
