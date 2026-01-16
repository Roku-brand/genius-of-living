// Foundation data aggregation
// This file exports all foundation category data

import { cognitionData } from './cognition.js';
import { behaviorData } from './behavior.js';
import { socialData } from './social.js';
import { structureData } from './structure.js';
import { wisdomData } from './wisdom.js';

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
