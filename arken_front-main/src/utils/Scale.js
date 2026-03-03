export const moderateScale = (size, factor = 0.5) => {
  const screenWidth = window.innerWidth;
  const guidelineBaseWidth = 375; // your design width
  return size + (screenWidth / guidelineBaseWidth - 1) * size * factor;
};