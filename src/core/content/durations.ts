import table from '../../../public/a/durations.json';
import type { DurationTable } from '../types';
import type { PhonemeId } from '../../content/phonics';
const data: Readonly<Record<string, number>> = table;
export const durations: DurationTable = {
  line: id => data[`l/${id}`], word: word => data[`w/${word}`], stretch: word => data[`x/${word}`],
  sound: (p: PhonemeId) => data[`p/${p}`], story: (story, page) => data[`s/${story}_${page}`],
};
export const durationTable = (data: Readonly<Record<string, number>>): DurationTable => ({
  line: id => data[`l/${id}`], word: text => data[`w/${text}`], stretch: text => data[`x/${text}`],
  sound: p => data[`p/${p}`], story: (story,page) => data[`s/${story}_${page}`],
});
