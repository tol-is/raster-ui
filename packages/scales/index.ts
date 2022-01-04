type ScaleParams = {
  base?: number;
  interval?: number;
  step?: number;
};

export const carbonScale = (params: ScaleParams = {}) => {
  const { base = 8, interval = 4, step = 2 } = params;

  function getIndex(index: number): number {
    if (index <= 1) {
      return base;
    }

    return getIndex(index - 1) + Math.floor((index - 2) / interval + 1) * step;
  }

  return (v: number) => getIndex(v + 1);
};
