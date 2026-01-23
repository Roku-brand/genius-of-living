// Foundation data aggregation
// This file exports all foundation category data

import { cognitionData as rawCognitionData } from './cognition.js';
import { behaviorData as rawBehaviorData } from './behavior.js';
import { socialData as rawSocialData } from './social.js';
import { structureData as rawStructureData } from './structure.js';
import { wisdomData as rawWisdomData } from './wisdom.js';

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
const hasItems = (value) => Array.isArray(value) && value.length > 0;

const defaultLifehacksByCategory = {
  cognition: ['冷静さを保つ処世術', '思考の歪みを見抜く処世術', '判断を止める処世術'],
  behavior: ['習慣設計の処世術', '時間管理の処世術', '夢と挑戦の処世術'],
  social: ['人たらしの処世術', '信頼を獲得する処世術', '交渉の処世術'],
  structure: ['集団の処世術', 'リーダーシップの処世術', '交渉の処世術'],
  wisdom: ['人生設計の処世術', '後悔しない処世術', '夢と挑戦の処世術'],
};
const fallbackLifehacks = ['人生設計の処世術', '信頼を獲得する処世術', '冷静さを保つ処世術'];

const normalizeFoundationItem = (item, category) => {
  const categoryId = category?.id;
  const categoryTitle = category?.title ?? '思想基盤';
  const summary = hasText(item.summary) ? item.summary : item.title;
  const definition = hasText(item.definition)
    ? item.definition
    : `${item.title}とは、${summary}を軸に状況理解と意思決定の質を高めるための思想・枠組み。`;
  const keyPoints = hasItems(item.keyPoints)
    ? item.keyPoints
    : [
        `${item.title}は「${summary}」という核となる考え方を持つ`,
        `目的・制約・関係性を整理し、行動の優先順位を明確にする`,
        `短期の成果だけでなく、継続的な改善や学習に目を向ける`,
      ];
  const pitfalls = hasItems(item.pitfalls)
    ? item.pitfalls
    : [
        `${item.title}を万能視すると他の視点や文脈を軽視しやすい`,
        `手法に引きずられて「本来の目的」を見失う`,
        '測定しやすい指標だけに偏ると重要な質的要素が抜け落ちる',
      ];
  const strategies = hasItems(item.strategies)
    ? item.strategies
    : [
        `${item.title}が役立つ場面・役立たない場面を事前に切り分ける`,
        '目的・制約・リスクを明文化し、実行前に合意形成する',
        '定期的に振り返り、学びを次の行動に反映させる',
      ];
  const applicationConditions = hasItems(item.applicationConditions)
    ? item.applicationConditions
    : [
        '判断材料が多く、優先順位付けに迷う場面',
        '改善や学習を継続しながら成果を積み上げたい場面',
        'チームや組織で共通の判断基準を持ちたい場面',
      ];
  const lifehacks = hasItems(item.lifehacks)
    ? item.lifehacks
    : defaultLifehacksByCategory[categoryId] || fallbackLifehacks;
  const tags = hasItems(item.tags) ? item.tags : [item.title, categoryTitle];
  const pageUrl =
    categoryId === 'wisdom' && item.tagId ? `./wisdom/${item.tagId}/` : item.pageUrl ?? null;

  return {
    ...item,
    summary,
    definition,
    keyPoints,
    pitfalls,
    strategies,
    applicationConditions,
    lifehacks,
    tags,
    pageUrl,
  };
};

const normalizeCategory = (category) => ({
  ...category,
  items: Array.isArray(category?.items)
    ? category.items.map((item) => normalizeFoundationItem(item, category))
    : [],
});

const cognitionData = normalizeCategory(rawCognitionData);
const behaviorData = normalizeCategory(rawBehaviorData);
const socialData = normalizeCategory(rawSocialData);
const structureData = normalizeCategory(rawStructureData);
const wisdomData = normalizeCategory(rawWisdomData);

// Export individual categories
export { cognitionData, behaviorData, socialData, structureData, wisdomData };

// Export all categories as an array (for tab rendering)
export const foundationCategories = [
  cognitionData,
  behaviorData,
  socialData,
  structureData,
  wisdomData,
];

// Helper function to get all items across all categories (for search)
export const getAllFoundationItems = () => {
  const allItems = [];
  foundationCategories.forEach((category) => {
    category.items.forEach((item) => {
      allItems.push({
        ...item,
        categoryId: category.id,
        categoryTitle: category.title,
        categoryPrefix: category.prefix,
      });
    });
  });
  return allItems;
};

// Helper function to search items by keyword
export const searchFoundationItems = (query) => {
  if (!query || query.trim() === '') {
    return getAllFoundationItems();
  }

  const lowerQuery = query.toLowerCase();
  return getAllFoundationItems().filter((item) => {
    return (
      item.title.toLowerCase().includes(lowerQuery) ||
      item.summary.toLowerCase().includes(lowerQuery) ||
      item.tagId.toLowerCase().includes(lowerQuery) ||
      item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      item.lifehacks.some((lifehack) => lifehack.toLowerCase().includes(lowerQuery))
    );
  });
};
