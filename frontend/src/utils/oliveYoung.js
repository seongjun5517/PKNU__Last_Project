export const getOliveYoungSearchUrl = (ingredientName) =>
  `https://www.oliveyoung.co.kr/store/search/getSearchMain.do?query=${encodeURIComponent(
    ingredientName
  )}&giftYn=N`;
