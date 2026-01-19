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
    : `${item.title}とは、${summary}を示す概念。`;
  const keyPoints = hasItems(item.keyPoints)
    ? item.keyPoints
    : [
        `${item.title}は「${summary}」という特徴を持つ`,
        `${item.title}は判断や行動の方向づけに影響する`,
        `状況や文脈で${item.title}の影響度は変化する`,
      ];
  const pitfalls = hasItems(item.pitfalls)
    ? item.pitfalls
    : [
        `${item.title}を過信すると他の視点を見落とす`,
        `${summary}に引きずられて判断が偏る`,
        '短期的な効果に偏ると長期的な損失につながる',
      ];
  const strategies = hasItems(item.strategies)
    ? item.strategies
    : [
        `${item.title}が働いている場面を言語化する`,
        '反対の視点や基準を用意してバランスを取る',
        '意思決定前に目的と判断基準を整理する',
      ];
  const applicationConditions = hasItems(item.applicationConditions)
    ? item.applicationConditions
    : [
        '意思決定や判断が難しい場面',
        '思考の偏りを見直したい場面',
        '行動やコミュニケーションを改善したい場面',
      ];
  const lifehacks = hasItems(item.lifehacks)
    ? item.lifehacks
    : defaultLifehacksByCategory[categoryId] || fallbackLifehacks;
  const tags = hasItems(item.tags) ? item.tags : [item.title, categoryTitle];

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
