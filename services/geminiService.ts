import { ReceiptData, HiddenContentItem } from "../types";

// Mock Data Pools for Chinese CS Student
const CASHIERS = ["教务处", "辅导员", "面试官", "宿管阿姨", "Debug大神", "GitHub", "StackOverflow"];

const CS_ITEMS = [
  { name: "Hello World", price: "梦开始的地方" },
  { name: "高等数学", price: "挂科预警" },
  { name: "线性代数", price: "天书" },
  { name: "C语言程序设计", price: "指针劝退" },
  { name: "Java大作业", price: "面向对象" },
  { name: "Python脚本", price: "人生苦短" },
  { name: "MySQL删库", price: "跑路" },
  { name: "Git Push -f", price: "事故现场" },
  { name: "404对象", price: "Not Found" },
  { name: "单身狗粮", price: "第二份半价" },
  { name: "通宵修仙", price: "发际线+1mm" },
  { name: "早八", price: "起床失败" },
  { name: "食堂阿姨", price: "手抖" },
  { name: "冰美式", price: "续命水" },
  { name: "Bug", price: "一红一片" },
  { name: "蓝屏", price: "崩溃" },
  { name: "奖学金", price: "请客吃饭" },
  { name: "CET-6", price: "424分" },
  { name: "毕业论文", price: "查重率99%" },
  { name: "实习工资", price: "白菜价" }
];

const TOTAL_LABELS = ["大学进度", "发量剩余", "精神状态", "代码行数", "GPA"];
const TOTAL_VALUES = ["Loading...", "Error", "Warning", "404", "2.5", "Null", "Stack Overflow"];
const TAX_LABELS = ["额外支出", "健康损耗", "精神损失费"];
const TAX_VALUES = ["颈椎", "视力-1.0", "睡眠", "黑眼圈", "发量"];

// New CS-specific stories (No romance, pure CS life)
const STORIES = [
  "本地运行正常，上线直接报错，这很合理。",
  "凌晨三点的提交记录，是强者的证明。",
  "没有什么是一个 sudo rm -rf /* 解决不了的。",
  "Ctrl+C 和 Ctrl+V 是我最熟练的两个快捷键。",
  "注释写得好，甚至比代码还能跑。",
  "这不是Bug，这是一个未被发现的Feature。",
  "为了改一个Bug，我又引入了三个新Bug。",
  "看到 Warning 直接忽略，只要没有 Error 就行。",
  "键盘敲击声是我听过最美妙的音乐。",
  "比起女朋友，我更想要一个不报错的控制台。"
];

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getRandomSubset = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Simulate API delay for realism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateReceipt = async (userPrompt: string): Promise<ReceiptData> => {
  await delay(800); // Fake network delay

  // Slightly reduce max item count to fit single screen better (4 to 6 items)
  const items: { name: string; price: string; qty?: number }[] = getRandomSubset(CS_ITEMS, Math.floor(Math.random() * 3) + 4);
  
  // If user provided a prompt, try to incorporate it as a custom item
  if (userPrompt && userPrompt.trim() !== "") {
    const customItemName = userPrompt.length > 10 ? userPrompt.substring(0, 10) + "..." : userPrompt;
    items.unshift({
      name: customItemName,
      qty: 1,
      price: "自定义经历"
    });
  }

  // Ensure "Object" is always missing for this persona (CS Pun intended)
  if (!items.some(i => i.name.includes("对象"))) {
     items.push({ name: "找对象", qty: 404, price: "Not Found" });
  }

  return {
    dateRange: "2006.02.09 - 2026.02.09",
    cashier: getRandom(CASHIERS),
    items: items.map(item => ({
      ...item,
      qty: item.qty || (Math.random() > 0.8 ? 1024 : Math.floor(Math.random() * 5) + 1)
    })),
    totalLabel: getRandom(TOTAL_LABELS),
    totalValue: getRandom(TOTAL_VALUES),
    taxLabel: getRandom(TAX_LABELS),
    taxValue: getRandom(TAX_VALUES)
  };
};

export const generatePolaroidStory = async (receiptItem: string): Promise<HiddenContentItem[]> => {
  await delay(600);
  
  let storyText = getRandom(STORIES);

  // Pure CS Context matching
  if (receiptItem.includes("Bug") || receiptItem.includes("代码") || receiptItem.includes("Java") || receiptItem.includes("C语言")) {
    storyText = "只有在编译通过的那一刻，世界才是美好的。";
  }
  else if (receiptItem.includes("对象") || receiptItem.includes("404")) {
    storyText = "对象(Object)可以New一个，但生活不行。";
  }
  else if (receiptItem.includes("食堂") || receiptItem.includes("饭") || receiptItem.includes("美式")) {
    storyText = "咖啡是把代码转换成屎山的燃料。";
  }
  else if (receiptItem.includes("高数") || receiptItem.includes("挂科") || receiptItem.includes("学")) {
    storyText = "只要专业选得好，年年期末胜高考。";
  }
  else if (receiptItem.includes("头发") || receiptItem.includes("修仙")) {
    storyText = "我的发际线，是我变强的见证。";
  }

  // Default fallback image
  const defaultImage = "https://images.pexels.com/photos/57980/pexels-photo-57980.jpeg?auto=compress&cs=tinysrgb&w=600";

  return [
    { id: '1', type: 'image', content: defaultImage },
    { id: '2', type: 'text', content: storyText }
  ];
};