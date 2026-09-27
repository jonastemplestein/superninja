// Jev draft for human review. Do not import as the runtime tags until reviewed.
import type { LineMeta } from "../types";
export const draftLineTags: Record<string, LineMeta> = {
  "again_practise": {
    "id": "again_practise",
    "hash": "fcea3c0a",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "audit_listen_next": {
    "id": "audit_listen_next",
    "hash": "88ca2fd4",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "ask"
      },
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "idea:last-sound",
        "as": "ask"
      }
    ],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "baron_final": {
    "id": "baron_final",
    "hash": "411c3d69",
    "who": "baron",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "baron_grr": {
    "id": "baron_grr",
    "hash": "13ad97e3",
    "who": "baron",
    "purpose": "banter",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "baron_lose": {
    "id": "baron_lose",
    "hash": "63738eb4",
    "who": "baron",
    "purpose": "instruction",
    "tags": [
      {
        "key": "char:baron",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "baron_taunt_1": {
    "id": "baron_taunt_1",
    "hash": "38c23a72",
    "who": "baron",
    "purpose": "banter",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "baron_taunt_2": {
    "id": "baron_taunt_2",
    "hash": "df90245c",
    "who": "baron",
    "purpose": "banter",
    "tags": [
      {
        "key": "char:baron",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "baron_taunt_3": {
    "id": "baron_taunt_3",
    "hash": "0274408d",
    "who": "baron",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "baron_w1": {
    "id": "baron_w1",
    "hash": "bd82e554",
    "who": "baron",
    "purpose": "banter",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "baron_w2": {
    "id": "baron_w2",
    "hash": "6805cb54",
    "who": "baron",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:sounds-have-spellings",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "baron_w3": {
    "id": "baron_w3",
    "hash": "75321264",
    "who": "baron",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "baron_w4": {
    "id": "baron_w4",
    "hash": "27c1aef8",
    "who": "baron",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "baron_w5": {
    "id": "baron_w5",
    "hash": "916da162",
    "who": "baron",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:sounds-have-spellings",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "baron_w6": {
    "id": "baron_w6",
    "hash": "3fe30cae",
    "who": "baron",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:sounds-have-spellings",
        "as": "ask"
      }
    ],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "battle_boss": {
    "id": "battle_boss",
    "hash": "ac0c1c10",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "battle_boss_win": {
    "id": "battle_boss_win",
    "hash": "29561978",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "battle_charge": {
    "id": "battle_charge",
    "hash": "f55ee18d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "battle_hint": {
    "id": "battle_hint",
    "hash": "2733b7c5",
    "who": "sensei",
    "purpose": "hint",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "battle_oops": {
    "id": "battle_oops",
    "hash": "e13f02f6",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "battle_spell": {
    "id": "battle_spell",
    "hash": "37a812ae",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "battle_start": {
    "id": "battle_start",
    "hash": "924577ec",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "char:baron",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "battle_win": {
    "id": "battle_win",
    "hash": "a49b3a12",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "book_i1": {
    "id": "book_i1",
    "hash": "2682bb47",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "obj:sticker-book",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "book_i2": {
    "id": "book_i2",
    "hash": "b9f1b5a1",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "obj:sticker-book",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "book_i3": {
    "id": "book_i3",
    "hash": "d3073746",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "obj:sticker-book",
        "as": "ask"
      },
      {
        "key": "idea:gems-fill-with-practice",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "book_intro": {
    "id": "book_intro",
    "hash": "7425c5eb",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "obj:sticker-book",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "book_missing": {
    "id": "book_missing",
    "hash": "1956c504",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "book_new": {
    "id": "book_new",
    "hash": "327944fa",
    "who": "sensei",
    "purpose": "reward",
    "tags": [
      {
        "key": "obj:sticker-book",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "break_time": {
    "id": "break_time",
    "hash": "b5ec5c16",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "build_ido_1": {
    "id": "build_ido_1",
    "hash": "8273c897",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [
      {
        "key": "idea:say-the-sounds-read-the-word",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "build_ido_2": {
    "id": "build_ido_2",
    "hash": "a58c7107",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "build_ido_3": {
    "id": "build_ido_3",
    "hash": "d6591cc1",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "challenge_start": {
    "id": "challenge_start",
    "hash": "5e1bebc6",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "chose": {
    "id": "chose",
    "hash": "0012d1ed",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "dojo_build": {
    "id": "dojo_build",
    "hash": "6bd7475d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "dojo_build_word": {
    "id": "dojo_build_word",
    "hash": "f5f63aeb",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "dojo_done": {
    "id": "dojo_done",
    "hash": "11fad389",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "dojo_find": {
    "id": "dojo_find",
    "hash": "5ded7620",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "dojo_hello": {
    "id": "dojo_hello",
    "hash": "d8c5f846",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "dojo_longer": {
    "id": "dojo_longer",
    "hash": "d8c99445",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "dojo_nap": {
    "id": "dojo_nap",
    "hash": "775daa85",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "dojo_tap_say": {
    "id": "dojo_tap_say",
    "hash": "946d7940",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "dojo_this_sound": {
    "id": "dojo_this_sound",
    "hash": "7a59df9d",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "film_1": {
    "id": "film_1",
    "hash": "f1fc93bb",
    "who": "sensei",
    "purpose": "exposition",
    "tags": [
      {
        "key": "obj:world-flower",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "film_2": {
    "id": "film_2",
    "hash": "b49bcfc3",
    "who": "sensei",
    "purpose": "exposition",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "film_3": {
    "id": "film_3",
    "hash": "365ce25d",
    "who": "baron",
    "purpose": "exposition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "film_4": {
    "id": "film_4",
    "hash": "17b1134a",
    "who": "baron",
    "purpose": "exposition",
    "tags": [
      {
        "key": "char:baron",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "film_5": {
    "id": "film_5",
    "hash": "3e3efa2d",
    "who": "sensei",
    "purpose": "exposition",
    "tags": [
      {
        "key": "fact:petals-scattered",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "film_6": {
    "id": "film_6",
    "hash": "e5116c25",
    "who": "sensei",
    "purpose": "exposition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "film_7": {
    "id": "film_7",
    "hash": "fab4996e",
    "who": "sensei",
    "purpose": "exposition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "film_8": {
    "id": "film_8",
    "hash": "ff07292f",
    "who": "sensei",
    "purpose": "exposition",
    "tags": [],
    "needs": [
      {
        "key": "mech:tile-to-line",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "finale": {
    "id": "finale",
    "hash": "d83e06a5",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "find_q": {
    "id": "find_q",
    "hash": "30c93666",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "ask"
      },
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "ask"
      }
    ],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "first_intro": {
    "id": "first_intro",
    "hash": "bbba235c",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "first_q": {
    "id": "first_q",
    "hash": "ab3f6a76",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "first_sound_q": {
    "id": "first_sound_q",
    "hash": "e00ecd79",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "ask"
      },
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "ask"
      },
      {
        "key": "mech:tile-to-line",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "flower_complete": {
    "id": "flower_complete",
    "hash": "245e2d82",
    "who": "sensei",
    "purpose": "praise",
    "tags": [
      {
        "key": "obj:world-flower",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "flower_i1": {
    "id": "flower_i1",
    "hash": "fd3d079f",
    "who": "sensei",
    "purpose": "exposition",
    "tags": [
      {
        "key": "char:baron",
        "as": "explain"
      },
      {
        "key": "fact:petals-scattered",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "flower_i2": {
    "id": "flower_i2",
    "hash": "decaaf46",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [
      {
        "key": "mech:tile-to-line",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "flower_i3": {
    "id": "flower_i3",
    "hash": "0898f136",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "flower_i4": {
    "id": "flower_i4",
    "hash": "72747885",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:gems-fill-with-practice",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "flower_i5": {
    "id": "flower_i5",
    "hash": "ffae6ae7",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "flower_i6": {
    "id": "flower_i6",
    "hash": "726f3cb3",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "obj:world-flower",
        "as": "explain"
      },
      {
        "key": "idea:gems-fill-with-practice",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "flower_intro": {
    "id": "flower_intro",
    "hash": "516409c4",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "obj:world-flower",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "flower_tap": {
    "id": "flower_tap",
    "hash": "ef4a0202",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:gems-fill-with-practice",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_diff_cat": {
    "id": "fm_diff_cat",
    "hash": "bb992436",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_diff_dog": {
    "id": "fm_diff_dog",
    "hash": "37f28ed4",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_diff_fish": {
    "id": "fm_diff_fish",
    "hash": "b62e3178",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_diff_moon": {
    "id": "fm_diff_moon",
    "hash": "f696e9dd",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_fast_sun": {
    "id": "fm_fast_sun",
    "hash": "816c6152",
    "who": "sensei",
    "purpose": "model",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_first_listen": {
    "id": "fm_first_listen",
    "hash": "4c824fe4",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_found_all": {
    "id": "fm_found_all",
    "hash": "2ed67c71",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_found_both": {
    "id": "fm_found_both",
    "hash": "1e4ad47c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_hear_sounds": {
    "id": "fm_hear_sounds",
    "hash": "d5598a8a",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "explain"
      },
      {
        "key": "idea:fast-and-slow-saying",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_hear_sounds_short": {
    "id": "fm_hear_sounds_short",
    "hash": "df1787a3",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_help_ok": {
    "id": "fm_help_ok",
    "hash": "4963ad0f",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_help_short": {
    "id": "fm_help_short",
    "hash": "fced8092",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:help-button",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_its_this": {
    "id": "fm_its_this",
    "hash": "16dd443a",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_l1_done": {
    "id": "fm_l1_done",
    "hash": "8688c4a3",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_l1_hello": {
    "id": "fm_l1_hello",
    "hash": "f859f0fd",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_l2_big_word": {
    "id": "fm_l2_big_word",
    "hash": "7e0a3622",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_l2_done": {
    "id": "fm_l2_done",
    "hash": "af72ad43",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_l2_start": {
    "id": "fm_l2_start",
    "hash": "c4de75a9",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_l2_swap": {
    "id": "fm_l2_swap",
    "hash": "c9ad3d5c",
    "who": "sensei",
    "purpose": "correction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_l2_turn": {
    "id": "fm_l2_turn",
    "hash": "21ac4df2",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_l2_way": {
    "id": "fm_l2_way",
    "hash": "02ad0f43",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_last_one": {
    "id": "fm_last_one",
    "hash": "5dad48d3",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [
      {
        "key": "idea:last-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "fm_look_this": {
    "id": "fm_look_this",
    "hash": "ff6db97f",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_name_cat": {
    "id": "fm_name_cat",
    "hash": "5ffbe449",
    "who": "sensei",
    "purpose": "naming",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_name_dog": {
    "id": "fm_name_dog",
    "hash": "bc72ae97",
    "who": "sensei",
    "purpose": "naming",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_name_fish": {
    "id": "fm_name_fish",
    "hash": "e546a335",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_name_flower": {
    "id": "fm_name_flower",
    "hash": "936fa3d6",
    "who": "sensei",
    "purpose": "naming",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_name_moon": {
    "id": "fm_name_moon",
    "hash": "348cd23c",
    "who": "sensei",
    "purpose": "naming",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_name_sausage": {
    "id": "fm_name_sausage",
    "hash": "00c3ad3c",
    "who": "sensei",
    "purpose": "naming",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_name_sock": {
    "id": "fm_name_sock",
    "hash": "e72904af",
    "who": "sensei",
    "purpose": "naming",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_name_star": {
    "id": "fm_name_star",
    "hash": "0eb7654b",
    "who": "sensei",
    "purpose": "naming",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_name_sun": {
    "id": "fm_name_sun",
    "hash": "92cc9037",
    "who": "sensei",
    "purpose": "naming",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_newyear_q": {
    "id": "fm_newyear_q",
    "hash": "9fa88bb8",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_newyear_up": {
    "id": "fm_newyear_up",
    "hash": "9739d8ff",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_not_in_dog": {
    "id": "fm_not_in_dog",
    "hash": "f1b2499c",
    "who": "sensei",
    "purpose": "correction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_not_in_sun": {
    "id": "fm_not_in_sun",
    "hash": "2e9cd0a8",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "fm_notice_sun_sock": {
    "id": "fm_notice_sun_sock",
    "hash": "73b63fa3",
    "who": "sensei",
    "purpose": "hint",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_default_home": {
    "id": "fm_opt_default_home",
    "hash": "466658f5",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_default_rec": {
    "id": "fm_opt_default_rec",
    "hash": "b0eb5cc9",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_echo_notyet": {
    "id": "fm_opt_echo_notyet",
    "hash": "f2bd8ef8",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_echo_school": {
    "id": "fm_opt_echo_school",
    "hash": "648fdf67",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_grownups": {
    "id": "fm_opt_grownups",
    "hash": "832fb1df",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:change-one-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_notyet": {
    "id": "fm_opt_notyet",
    "hash": "1dfc35f1",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_ok_notyet": {
    "id": "fm_opt_ok_notyet",
    "hash": "f35f0c94",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_ok_rec": {
    "id": "fm_opt_ok_rec",
    "hash": "18367a58",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_ok_unsure": {
    "id": "fm_opt_ok_unsure",
    "hash": "7d0947e9",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_ok_y1": {
    "id": "fm_opt_ok_y1",
    "hash": "5a71c7ec",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_ok_y2": {
    "id": "fm_opt_ok_y2",
    "hash": "5e09a6af",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_q1": {
    "id": "fm_opt_q1",
    "hash": "579fc966",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_q1_again": {
    "id": "fm_opt_q1_again",
    "hash": "979a66d4",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_q2": {
    "id": "fm_opt_q2",
    "hash": "9f26b3b8",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_q2_again": {
    "id": "fm_opt_q2_again",
    "hash": "8b2824e1",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_rec": {
    "id": "fm_opt_rec",
    "hash": "48ccb05a",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_unsure": {
    "id": "fm_opt_unsure",
    "hash": "7d36acd0",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_y1": {
    "id": "fm_opt_y1",
    "hash": "19dd8e76",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_y2": {
    "id": "fm_opt_y2",
    "hash": "a6036594",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_opt_yes": {
    "id": "fm_opt_yes",
    "hash": "e7264d43",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_pair_cat_dog": {
    "id": "fm_pair_cat_dog",
    "hash": "6c23eb3f",
    "who": "sensei",
    "purpose": "naming",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_pair_fish_dog": {
    "id": "fm_pair_fish_dog",
    "hash": "fb762a09",
    "who": "sensei",
    "purpose": "naming",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_quick_tap_all": {
    "id": "fm_quick_tap_all",
    "hash": "4dce42bb",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_rainbow_q": {
    "id": "fm_rainbow_q",
    "hash": "f37b4d4a",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_read_fish_dog": {
    "id": "fm_read_fish_dog",
    "hash": "01f976d1",
    "who": "sensei",
    "purpose": "naming",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_rw_book": {
    "id": "fm_rw_book",
    "hash": "44062556",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "obj:sticker-book",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_rw_every": {
    "id": "fm_rw_every",
    "hash": "a79716f3",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:stickers-for-pictures",
        "as": "explain"
      },
      {
        "key": "mech:tap-picture",
        "as": "explain"
      },
      {
        "key": "obj:sticker-book",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_rw_look": {
    "id": "fm_rw_look",
    "hash": "ddb57a56",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:stickers-for-pictures",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_rw_more": {
    "id": "fm_rw_more",
    "hash": "0617a0d2",
    "who": "sensei",
    "purpose": "reward",
    "tags": [
      {
        "key": "obj:sticker-book",
        "as": "mention"
      },
      {
        "key": "idea:stickers-for-pictures",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "obj:sticker-book",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "fm_rw_next": {
    "id": "fm_rw_next",
    "hash": "d4e2c9cf",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_rw_shiny": {
    "id": "fm_rw_shiny",
    "hash": "181d838d",
    "who": "sensei",
    "purpose": "naming",
    "tags": [
      {
        "key": "obj:sticker-book",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_rw_tap": {
    "id": "fm_rw_tap",
    "hash": "9b8c0276",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_rw1_list": {
    "id": "fm_rw1_list",
    "hash": "8e920622",
    "who": "sensei",
    "purpose": "naming",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_rw2_list": {
    "id": "fm_rw2_list",
    "hash": "86e43216",
    "who": "sensei",
    "purpose": "naming",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_rw2_map": {
    "id": "fm_rw2_map",
    "hash": "0a090079",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_rw2_petal": {
    "id": "fm_rw2_petal",
    "hash": "aaec7966",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "obj:petal",
        "as": "mention"
      },
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_rw2_s": {
    "id": "fm_rw2_s",
    "hash": "99466dfe",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_same_word": {
    "id": "fm_same_word",
    "hash": "717bceab",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "fm_slow": {
    "id": "fm_slow",
    "hash": "ab45dc42",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_slow_another": {
    "id": "fm_slow_another",
    "hash": "93f68a60",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "fm_slow_listen": {
    "id": "fm_slow_listen",
    "hash": "6480537b",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_snowman_q": {
    "id": "fm_snowman_q",
    "hash": "d0e8bafd",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_starfish": {
    "id": "fm_starfish",
    "hash": "deadc59b",
    "who": "sensei",
    "purpose": "naming",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_starfish_q": {
    "id": "fm_starfish_q",
    "hash": "9a5f820e",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_sunflower": {
    "id": "fm_sunflower",
    "hash": "5f9dde09",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_super_listener": {
    "id": "fm_super_listener",
    "hash": "9f41ccaa",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_tap_all_in": {
    "id": "fm_tap_all_in",
    "hash": "52eff15c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_tap_all_start": {
    "id": "fm_tap_all_start",
    "hash": "5cd51b31",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_tap_all_words_in": {
    "id": "fm_tap_all_words_in",
    "hash": "f25e4110",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      },
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "fm_tap_rabbit": {
    "id": "fm_tap_rabbit",
    "hash": "8cbf3f0f",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_tap_sock": {
    "id": "fm_tap_sock",
    "hash": "3637464f",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_tap_tortoise": {
    "id": "fm_tap_tortoise",
    "hash": "df9d8927",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_warm_up": {
    "id": "fm_warm_up",
    "hash": "0978da18",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "fm_which_cat_dog": {
    "id": "fm_which_cat_dog",
    "hash": "a353ea89",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "fm_which_pic": {
    "id": "fm_which_pic",
    "hash": "d90236f1",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "gem_charging": {
    "id": "gem_charging",
    "hash": "bb9d4c06",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "gem_energy": {
    "id": "gem_energy",
    "hash": "06411ef8",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "gem_future": {
    "id": "gem_future",
    "hash": "85d0deff",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "gem_hidden": {
    "id": "gem_hidden",
    "hash": "a225635d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "gem_ready": {
    "id": "gem_ready",
    "hash": "49ebb9eb",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "grownups": {
    "id": "grownups",
    "hash": "849e4535",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "has_in_middle": {
    "id": "has_in_middle",
    "hash": "2d4d4ffe",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "ask"
      },
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "ask"
      },
      {
        "key": "mech:tile-to-line",
        "as": "ask"
      }
    ],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "help_book": {
    "id": "help_book",
    "hash": "a491df83",
    "who": "sensei",
    "purpose": "hint",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "help_choose": {
    "id": "help_choose",
    "hash": "a3cd7480",
    "who": "sensei",
    "purpose": "hint",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "help_flower": {
    "id": "help_flower",
    "hash": "d53359e0",
    "who": "sensei",
    "purpose": "hint",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "help_listen": {
    "id": "help_listen",
    "hash": "98e5cbfd",
    "who": "sensei",
    "purpose": "hint",
    "tags": [
      {
        "key": "mech:replay-button",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "help_look": {
    "id": "help_look",
    "hash": "b959f8f3",
    "who": "sensei",
    "purpose": "hint",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "help_map": {
    "id": "help_map",
    "hash": "8de7f386",
    "who": "sensei",
    "purpose": "hint",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "help_name": {
    "id": "help_name",
    "hash": "7d86134d",
    "who": "sensei",
    "purpose": "hint",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "help_next": {
    "id": "help_next",
    "hash": "58e529b0",
    "who": "sensei",
    "purpose": "hint",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "help_players": {
    "id": "help_players",
    "hash": "98593943",
    "who": "sensei",
    "purpose": "hint",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "help_question": {
    "id": "help_question",
    "hash": "c3f25153",
    "who": "sensei",
    "purpose": "hint",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "help_read": {
    "id": "help_read",
    "hash": "561641c6",
    "who": "sensei",
    "purpose": "hint",
    "tags": [
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "help_run": {
    "id": "help_run",
    "hash": "588e3cf0",
    "who": "sensei",
    "purpose": "hint",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "help_sort": {
    "id": "help_sort",
    "hash": "3b853b99",
    "who": "sensei",
    "purpose": "hint",
    "tags": [
      {
        "key": "term:spelling",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "help_start": {
    "id": "help_start",
    "hash": "2d4c31a7",
    "who": "sensei",
    "purpose": "hint",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "help_story": {
    "id": "help_story",
    "hash": "8ed71506",
    "who": "sensei",
    "purpose": "hint",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "help_swap_new": {
    "id": "help_swap_new",
    "hash": "f270ad65",
    "who": "sensei",
    "purpose": "hint",
    "tags": [
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "help_swap_pos": {
    "id": "help_swap_pos",
    "hash": "4f781973",
    "who": "sensei",
    "purpose": "hint",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "help_tiles": {
    "id": "help_tiles",
    "hash": "5bab4904",
    "who": "sensei",
    "purpose": "hint",
    "tags": [
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "how_we_spell": {
    "id": "how_we_spell",
    "hash": "65698f14",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "hunt_intro": {
    "id": "hunt_intro",
    "hash": "78285d47",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "hunt_q": {
    "id": "hunt_q",
    "hash": "62734ad3",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "ask"
      },
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "ask"
      },
      {
        "key": "mech:tile-to-line",
        "as": "ask"
      }
    ],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      },
      {
        "key": "idea:middle-sound",
        "level": "explained"
      },
      {
        "key": "idea:one-line-per-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "i_am_ninja": {
    "id": "i_am_ninja",
    "hash": "867cce81",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "i_can_hear": {
    "id": "i_can_hear",
    "hash": "cb5ff895",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "ido": {
    "id": "ido",
    "hash": "0cd10f22",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "if_it_was": {
    "id": "if_it_was",
    "hash": "8e2236d7",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "intro_8": {
    "id": "intro_8",
    "hash": "bda3db36",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "char:sensei",
        "as": "mention"
      },
      {
        "key": "mech:tap-reader",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "is_it_no": {
    "id": "is_it_no",
    "hash": "5c5ff225",
    "who": "sensei",
    "purpose": "correction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "its": {
    "id": "its",
    "hash": "9dacb4e1",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "its_this_one": {
    "id": "its_this_one",
    "hash": "31342d6f",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "jump_done": {
    "id": "jump_done",
    "hash": "97939427",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "jump_offer": {
    "id": "jump_offer",
    "hash": "58733982",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "jump_pick": {
    "id": "jump_pick",
    "hash": "b3f99ad3",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:tap-reader",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "kai_says": {
    "id": "kai_says",
    "hash": "9643de9b",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "last_sound_q": {
    "id": "last_sound_q",
    "hash": "92e01175",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "ask"
      },
      {
        "key": "mech:tile-to-line",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "like_in": {
    "id": "like_in",
    "hash": "82d2ea5a",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "listen": {
    "id": "listen",
    "hash": "ee2a20bd",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "listen_again": {
    "id": "listen_again",
    "hash": "924ae45d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "listen_here": {
    "id": "listen_here",
    "hash": "0a671974",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "mech:replay-button",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "listen_intro": {
    "id": "listen_intro",
    "hash": "f43e904b",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "listen_slow": {
    "id": "listen_slow",
    "hash": "8fb9cb3e",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "listen_sounds": {
    "id": "listen_sounds",
    "hash": "fad4b3d4",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "listen_tap": {
    "id": "listen_tap",
    "hash": "c8154d22",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "map_hint": {
    "id": "map_hint",
    "hash": "0a0394d3",
    "who": "sensei",
    "purpose": "hint",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "map_locked": {
    "id": "map_locked",
    "hash": "ac9c4f12",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "map_tree": {
    "id": "map_tree",
    "hash": "82285887",
    "who": "sensei",
    "purpose": "naming",
    "tags": [
      {
        "key": "obj:world-flower",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "nav_ready": {
    "id": "nav_ready",
    "hash": "f85ee87e",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "nearly": {
    "id": "nearly",
    "hash": "ed625419",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "next_sound_q": {
    "id": "next_sound_q",
    "hash": "9003af4e",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "ask"
      },
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "ask"
      },
      {
        "key": "mech:tile-to-line",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "not_quite": {
    "id": "not_quite",
    "hash": "3a050f58",
    "who": "sensei",
    "purpose": "correction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "petal_complete": {
    "id": "petal_complete",
    "hash": "c2cb50b8",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "obj:world-flower",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "petal_got": {
    "id": "petal_got",
    "hash": "a9d473fb",
    "who": "sensei",
    "purpose": "reward",
    "tags": [],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "petal_secret": {
    "id": "petal_secret",
    "hash": "1634e9a3",
    "who": "sensei",
    "purpose": "hint",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "petals_got": {
    "id": "petals_got",
    "hash": "28457f3f",
    "who": "sensei",
    "purpose": "reward",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "place_ask": {
    "id": "place_ask",
    "hash": "59a5dc12",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "ask"
      },
      {
        "key": "idea:first-sound",
        "as": "ask"
      },
      {
        "key": "idea:middle-sound",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "place_done": {
    "id": "place_done",
    "hash": "99053911",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "place_findall": {
    "id": "place_findall",
    "hash": "29f6c85c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "place_gap": {
    "id": "place_gap",
    "hash": "2bc8b60c",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "term:spelling",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "place_gap_in": {
    "id": "place_gap_in",
    "hash": "675baacc",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "place_intro": {
    "id": "place_intro",
    "hash": "f0eb661e",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "place_new": {
    "id": "place_new",
    "hash": "ac6a59e5",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "place_sound": {
    "id": "place_sound",
    "hash": "af978531",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "ask"
      },
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "term:spelling",
        "as": "ask"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "place_spell": {
    "id": "place_spell",
    "hash": "64c91e75",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "place_tap": {
    "id": "place_tap",
    "hash": "db937f0d",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "r2_dog_fish": {
    "id": "r2_dog_fish",
    "hash": "0c7958e5",
    "who": "sensei",
    "purpose": "naming",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "r2_gems_more": {
    "id": "r2_gems_more",
    "hash": "fde0173a",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:gems-fill-with-practice",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "read_intro": {
    "id": "read_intro",
    "hash": "1372775b",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "read_tap_sounds": {
    "id": "read_tap_sounds",
    "hash": "e63f9aaa",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "read_who": {
    "id": "read_who",
    "hash": "1425dd1e",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:left-to-right",
        "as": "ask"
      },
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "read_word": {
    "id": "read_word",
    "hash": "d8cbf68f",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "run_blend": {
    "id": "run_blend",
    "hash": "191919cb",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "ask"
      },
      {
        "key": "idea:first-sound",
        "as": "ask"
      },
      {
        "key": "idea:middle-sound",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "run_catch": {
    "id": "run_catch",
    "hash": "52127c74",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "run_end": {
    "id": "run_end",
    "hash": "884657ca",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "run_read": {
    "id": "run_read",
    "hash": "a7d669bd",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "run_start": {
    "id": "run_start",
    "hash": "29776148",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "same_sound_diff": {
    "id": "same_sound_diff",
    "hash": "625e03ee",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "same_sound_new": {
    "id": "same_sound_new",
    "hash": "f22a262d",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "term:spelling",
        "as": "explain"
      }
    ],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "same_sound_spelling": {
    "id": "same_sound_spelling",
    "hash": "254d7c91",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "term:spelling",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "say_sounds": {
    "id": "say_sounds",
    "hash": "d41fd8bc",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "say_sounds_read": {
    "id": "say_sounds_read",
    "hash": "04821510",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "sort_done": {
    "id": "sort_done",
    "hash": "132deadc",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "sort_start": {
    "id": "sort_start",
    "hash": "ed1b21fd",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "st_another_new_sound": {
    "id": "st_another_new_sound",
    "hash": "41fc3fe6",
    "who": "sensei",
    "purpose": "transition",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:last-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "st_find_q2": {
    "id": "st_find_q2",
    "hash": "f49843cb",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "st_find_q3": {
    "id": "st_find_q3",
    "hash": "3b6d5a91",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "st_first_changes": {
    "id": "st_first_changes",
    "hash": "271c453b",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "st_first_q2": {
    "id": "st_first_q2",
    "hash": "18c0fee8",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "st_first_q3": {
    "id": "st_first_q3",
    "hash": "66c55f12",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "st_found_new_sounds": {
    "id": "st_found_new_sounds",
    "hash": "9d629e35",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "fact:petals-scattered",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "st_hear_three": {
    "id": "st_hear_three",
    "hash": "7eb38c27",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "st_hear_two": {
    "id": "st_hear_two",
    "hash": "665a6d9d",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "st_know_this_sound": {
    "id": "st_know_this_sound",
    "hash": "aa580134",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "st_last_changes": {
    "id": "st_last_changes",
    "hash": "fc1d8395",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:last-sound",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      },
      {
        "key": "idea:last-sound",
        "level": "explained"
      },
      {
        "key": "idea:one-line-per-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "st_last_one": {
    "id": "st_last_one",
    "hash": "5dad48d3",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [
      {
        "key": "idea:last-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "st_middle_changes": {
    "id": "st_middle_changes",
    "hash": "ac825f3e",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "st_th_moth_sometimes": {
    "id": "st_th_moth_sometimes",
    "hash": "74384cea",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "st_two_letters_too": {
    "id": "st_two_letters_too",
    "hash": "60056aba",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "st_what_change": {
    "id": "st_what_change",
    "hash": "a5ede487",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:change-one-sound",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "starts_with": {
    "id": "starts_with",
    "hash": "1028003d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "stays_same": {
    "id": "stays_same",
    "hash": "4529014d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "story_choose": {
    "id": "story_choose",
    "hash": "de6db8b9",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "story_end": {
    "id": "story_end",
    "hash": "6bdb0d28",
    "who": "sensei",
    "purpose": "story",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "story_question": {
    "id": "story_question",
    "hash": "1b1d6418",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "story_start": {
    "id": "story_start",
    "hash": "024727ef",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "story_tap_help": {
    "id": "story_tap_help",
    "hash": "861dc2a7",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:help-button",
        "as": "explain"
      },
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "story_your_turn": {
    "id": "story_your_turn",
    "hash": "7c82b063",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "streak_10": {
    "id": "streak_10",
    "hash": "0f91b893",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "vary"
  },
  "streak_3": {
    "id": "streak_3",
    "hash": "01e3586a",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "vary"
  },
  "streak_6": {
    "id": "streak_6",
    "hash": "66292d3e",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "vary"
  },
  "streak_lost": {
    "id": "streak_lost",
    "hash": "4250a6e7",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "vary"
  },
  "suki_says": {
    "id": "suki_says",
    "hash": "65662114",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "swap_done": {
    "id": "swap_done",
    "hash": "c8a28a4b",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "swap_make": {
    "id": "swap_make",
    "hash": "98a8a630",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "swap_pick": {
    "id": "swap_pick",
    "hash": "4a617f9d",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "swap_start": {
    "id": "swap_start",
    "hash": "6961ef31",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "char:baron",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "swap_which": {
    "id": "swap_which",
    "hash": "040ec1cf",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "ask"
      },
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "ask"
      },
      {
        "key": "mech:tile-to-line",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "t_and": {
    "id": "t_and",
    "hash": "6480eb21",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_and_sometimes": {
    "id": "t_and_sometimes",
    "hash": "231c275f",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_another_way": {
    "id": "t_another_way",
    "hash": "5804dff5",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "t_but_in_this_word": {
    "id": "t_but_in_this_word",
    "hash": "b7b8ac35",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      },
      {
        "key": "idea:say-the-sounds-read-the-word",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "t_diff_spellings_of": {
    "id": "t_diff_spellings_of",
    "hash": "91708ccd",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:sounds-have-spellings",
        "as": "mention"
      },
      {
        "key": "term:spelling",
        "as": "mention"
      },
      {
        "key": "idea:same-sound-different-spellings",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "t_does_it_have": {
    "id": "t_does_it_have",
    "hash": "b57d3613",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "idea:sounds-have-spellings",
        "as": "ask"
      },
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "t_everyone_say": {
    "id": "t_everyone_say",
    "hash": "55f7a312",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_four_letters": {
    "id": "t_four_letters",
    "hash": "06e099d1",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "t_here": {
    "id": "t_here",
    "hash": "5acc849c",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_if_you_say_sounds": {
    "id": "t_if_you_say_sounds",
    "hash": "d0523160",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "explain"
      },
      {
        "key": "idea:first-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "t_in": {
    "id": "t_in",
    "hash": "4d50d00f",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_in_these_words": {
    "id": "t_in_these_words",
    "hash": "d0d440e6",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "ask"
      },
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "ask"
      }
    ],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "t_in_this_word_this_is": {
    "id": "t_in_this_word_this_is",
    "hash": "504d4713",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_lets_remember": {
    "id": "t_lets_remember",
    "hash": "b2a1d6f6",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_like_in": {
    "id": "t_like_in",
    "hash": "5bc66044",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_listen_can_you_hear": {
    "id": "t_listen_can_you_hear",
    "hash": "1223ccde",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_listen_for_word": {
    "id": "t_listen_for_word",
    "hash": "4dc6219c",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "t_look_growing": {
    "id": "t_look_growing",
    "hash": "87eeb115",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "obj:world-flower",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "t_new_gem_here": {
    "id": "t_new_gem_here",
    "hash": "5ab56ae5",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_now_you_say_it": {
    "id": "t_now_you_say_it",
    "hash": "8a44d79e",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_often_end_short": {
    "id": "t_often_end_short",
    "hash": "9d07f007",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      },
      {
        "key": "idea:say-the-sounds-read-the-word",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "t_one_spelling_two_sounds": {
    "id": "t_one_spelling_two_sounds",
    "hash": "74e2270b",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:sounds-have-spellings",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "t_or": {
    "id": "t_or",
    "hash": "88e2ad55",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_petal_is": {
    "id": "t_petal_is",
    "hash": "e7ba700c",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "t_practise_invite": {
    "id": "t_practise_invite",
    "hash": "9eedc452",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "term:dojo",
        "as": "ask"
      }
    ],
    "needs": [
      {
        "key": "term:dojo",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "t_remember_this": {
    "id": "t_remember_this",
    "hash": "3e89e182",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_same_sound": {
    "id": "t_same_sound",
    "hash": "0684e605",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_same_spelling_sometimes": {
    "id": "t_same_spelling_sometimes",
    "hash": "b30db9a0",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "term:spelling",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "t_say": {
    "id": "t_say",
    "hash": "142bf1d5",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_say_it_here": {
    "id": "t_say_it_here",
    "hash": "dead4f77",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_spelling_of": {
    "id": "t_spelling_of",
    "hash": "d437f7a0",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "term:spelling",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "t_they_all_have": {
    "id": "t_they_all_have",
    "hash": "5b94fabb",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:sounds-have-spellings",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      },
      {
        "key": "idea:middle-sound",
        "level": "explained"
      },
      {
        "key": "idea:one-line-per-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "t_this_can_be": {
    "id": "t_this_can_be",
    "hash": "37a65bd5",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_this_is_sound": {
    "id": "t_this_is_sound",
    "hash": "c9f3adf0",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      },
      {
        "key": "mech:tile-to-line",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "mech:tile-to-line",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "t_three_letters": {
    "id": "t_three_letters",
    "hash": "c3bc005f",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "t_two_letters": {
    "id": "t_two_letters",
    "hash": "87671413",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:two-letters-one-sound",
        "as": "explain"
      },
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "t_visit": {
    "id": "t_visit",
    "hash": "2e77f857",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "obj:world-flower",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "t_way_we_spell": {
    "id": "t_way_we_spell",
    "hash": "a1f6ad2e",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_ways_10": {
    "id": "t_ways_10",
    "hash": "ed43a4d2",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_ways_2": {
    "id": "t_ways_2",
    "hash": "02677335",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_ways_3": {
    "id": "t_ways_3",
    "hash": "97a9e1fb",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_ways_4": {
    "id": "t_ways_4",
    "hash": "967a13a7",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_ways_5": {
    "id": "t_ways_5",
    "hash": "1050766b",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_ways_6": {
    "id": "t_ways_6",
    "hash": "a46ee433",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_ways_7": {
    "id": "t_ways_7",
    "hash": "57103df0",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_ways_8": {
    "id": "t_ways_8",
    "hash": "cd32c3d6",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_ways_9": {
    "id": "t_ways_9",
    "hash": "7bb3029b",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_we_see_it_in": {
    "id": "t_we_see_it_in",
    "hash": "87a4fc58",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "term:spelling",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "t_words_you_found": {
    "id": "t_words_you_found",
    "hash": "77f8c8ac",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "t_you_can_hear_it_in": {
    "id": "t_you_can_hear_it_in",
    "hash": "7ab1b63d",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tap_start": {
    "id": "tap_start",
    "hash": "76484923",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_a_a_in": {
    "id": "tg_a_a_in",
    "hash": "f3f6eb65",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:a>a",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_a_a_like": {
    "id": "tg_a_a_like",
    "hash": "2a1b49b4",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:a>a",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_a_a_see": {
    "id": "tg_a_a_see",
    "hash": "de89bdfe",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_a_a_way": {
    "id": "tg_a_a_way",
    "hash": "30c6cea8",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:a>a",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ai_ae_in": {
    "id": "tg_ai_ae_in",
    "hash": "3126f1d3",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ai_ae_like": {
    "id": "tg_ai_ae_like",
    "hash": "694e654d",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ai_ae_see": {
    "id": "tg_ai_ae_see",
    "hash": "51819a13",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ai_ae_way": {
    "id": "tg_ai_ae_way",
    "hash": "235d9354",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ai>ae",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ay_ae_in": {
    "id": "tg_ay_ae_in",
    "hash": "64038935",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ay_ae_like": {
    "id": "tg_ay_ae_like",
    "hash": "a541aac8",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ay_ae_see": {
    "id": "tg_ay_ae_see",
    "hash": "6374b254",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ay_ae_way": {
    "id": "tg_ay_ae_way",
    "hash": "2520b3f6",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ay>ae",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_b_b_in": {
    "id": "tg_b_b_in",
    "hash": "15c63236",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:b>b",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_b_b_like": {
    "id": "tg_b_b_like",
    "hash": "57528e75",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_b_b_see": {
    "id": "tg_b_b_see",
    "hash": "2ee76bda",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_b_b_way": {
    "id": "tg_b_b_way",
    "hash": "9956c173",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:b>b",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_c_k_in": {
    "id": "tg_c_k_in",
    "hash": "4ed4dedf",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:c>k",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_c_k_like": {
    "id": "tg_c_k_like",
    "hash": "407d3185",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_c_k_see": {
    "id": "tg_c_k_see",
    "hash": "87960241",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:c>k",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_c_k_way": {
    "id": "tg_c_k_way",
    "hash": "5df4bb3a",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:c>k",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ch_ch_in": {
    "id": "tg_ch_ch_in",
    "hash": "ee779ddb",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ch_ch_like": {
    "id": "tg_ch_ch_like",
    "hash": "542b6d86",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ch>ch",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ch_ch_see": {
    "id": "tg_ch_ch_see",
    "hash": "0abe25aa",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ch_ch_way": {
    "id": "tg_ch_ch_way",
    "hash": "261b14d2",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ch>ch",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ck_k_in": {
    "id": "tg_ck_k_in",
    "hash": "c83a8c66",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ck>k",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ck_k_like": {
    "id": "tg_ck_k_like",
    "hash": "e4fac317",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ck_k_see": {
    "id": "tg_ck_k_see",
    "hash": "118b5452",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ck_k_way": {
    "id": "tg_ck_k_way",
    "hash": "f0604b51",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ck>k",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_d_d_in": {
    "id": "tg_d_d_in",
    "hash": "f233bd99",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:d>d",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_d_d_like": {
    "id": "tg_d_d_like",
    "hash": "00f1e5d1",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_d_d_see": {
    "id": "tg_d_d_see",
    "hash": "baef574b",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_d_d_way": {
    "id": "tg_d_d_way",
    "hash": "a875f638",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:d>d",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_e_e_in": {
    "id": "tg_e_e_in",
    "hash": "02203362",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:e>e",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_e_e_like": {
    "id": "tg_e_e_like",
    "hash": "602a6a49",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_e_e_see": {
    "id": "tg_e_e_see",
    "hash": "d7dcc2ea",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_e_e_way": {
    "id": "tg_e_e_way",
    "hash": "560eb2af",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:e>e",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ea_ee_in": {
    "id": "tg_ea_ee_in",
    "hash": "ce4a900d",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ea_ee_like": {
    "id": "tg_ea_ee_like",
    "hash": "63dad4b4",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ea_ee_see": {
    "id": "tg_ea_ee_see",
    "hash": "4cbc2d38",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ea_ee_way": {
    "id": "tg_ea_ee_way",
    "hash": "17f75f1e",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ea>ee",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ee_ee_in": {
    "id": "tg_ee_ee_in",
    "hash": "a9ead1bf",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ee_ee_like": {
    "id": "tg_ee_ee_like",
    "hash": "c87aad2d",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ee_ee_see": {
    "id": "tg_ee_ee_see",
    "hash": "d772a499",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ee_ee_way": {
    "id": "tg_ee_ee_way",
    "hash": "ebf0e1c2",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ee>ee",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_f_f_in": {
    "id": "tg_f_f_in",
    "hash": "f10f1cf0",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:f>f",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_f_f_like": {
    "id": "tg_f_f_like",
    "hash": "db240eaa",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_f_f_see": {
    "id": "tg_f_f_see",
    "hash": "8d22abeb",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_f_f_way": {
    "id": "tg_f_f_way",
    "hash": "24f1f505",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:f>f",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ff_f_in": {
    "id": "tg_ff_f_in",
    "hash": "6490ca30",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ff>f",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ff_f_like": {
    "id": "tg_ff_f_like",
    "hash": "a29af7f2",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ff>f",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ff_f_see": {
    "id": "tg_ff_f_see",
    "hash": "dd8c3e3b",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ff_f_way": {
    "id": "tg_ff_f_way",
    "hash": "ae520d3d",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ff>f",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_g_g_in": {
    "id": "tg_g_g_in",
    "hash": "f7a5af51",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_g_g_like": {
    "id": "tg_g_g_like",
    "hash": "d29f57c3",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_g_g_see": {
    "id": "tg_g_g_see",
    "hash": "80533b75",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "term:spelling",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_g_g_way": {
    "id": "tg_g_g_way",
    "hash": "37315654",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:g>g",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_h_h_in": {
    "id": "tg_h_h_in",
    "hash": "c175d1e8",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_h_h_like": {
    "id": "tg_h_h_like",
    "hash": "fecf63d3",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_h_h_see": {
    "id": "tg_h_h_see",
    "hash": "1f76e6ba",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_h_h_way": {
    "id": "tg_h_h_way",
    "hash": "4780ca25",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:h>h",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_i_i_in": {
    "id": "tg_i_i_in",
    "hash": "58d3ac67",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_i_i_like": {
    "id": "tg_i_i_like",
    "hash": "656ffc63",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_i_i_see": {
    "id": "tg_i_i_see",
    "hash": "380eaa5f",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_i_i_way": {
    "id": "tg_i_i_way",
    "hash": "48430842",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:i>i",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ie_ie_in": {
    "id": "tg_ie_ie_in",
    "hash": "45047995",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ie_ie_like": {
    "id": "tg_ie_ie_like",
    "hash": "c38cb265",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ie_ie_see": {
    "id": "tg_ie_ie_see",
    "hash": "1adf62a7",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ie_ie_way": {
    "id": "tg_ie_ie_way",
    "hash": "fc672108",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ie>ie",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_igh_ie_in": {
    "id": "tg_igh_ie_in",
    "hash": "212e4ed7",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_igh_ie_like": {
    "id": "tg_igh_ie_like",
    "hash": "258c9897",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_igh_ie_see": {
    "id": "tg_igh_ie_see",
    "hash": "e7eb335b",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_igh_ie_way": {
    "id": "tg_igh_ie_way",
    "hash": "0011156a",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:igh>ie",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_j_j_in": {
    "id": "tg_j_j_in",
    "hash": "5dfc37f3",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_j_j_like": {
    "id": "tg_j_j_like",
    "hash": "ddd94a47",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_j_j_see": {
    "id": "tg_j_j_see",
    "hash": "c8676d97",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_j_j_way": {
    "id": "tg_j_j_way",
    "hash": "e792a9b6",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:j>j",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_k_k_in": {
    "id": "tg_k_k_in",
    "hash": "acc36db2",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:k>k",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_k_k_like": {
    "id": "tg_k_k_like",
    "hash": "52171e38",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:k>k",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_k_k_see": {
    "id": "tg_k_k_see",
    "hash": "f45c42a3",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_k_k_way": {
    "id": "tg_k_k_way",
    "hash": "587fdbd7",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:k>k",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_l_l_in": {
    "id": "tg_l_l_in",
    "hash": "0645626f",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_l_l_like": {
    "id": "tg_l_l_like",
    "hash": "d8c9df82",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_l_l_see": {
    "id": "tg_l_l_see",
    "hash": "08eaad7e",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:l>l",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_l_l_way": {
    "id": "tg_l_l_way",
    "hash": "3c434582",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ll_l_in": {
    "id": "tg_ll_l_in",
    "hash": "ce84b27a",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ll_l_like": {
    "id": "tg_ll_l_like",
    "hash": "aeb727dd",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ll_l_see": {
    "id": "tg_ll_l_see",
    "hash": "adc9e484",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ll_l_way": {
    "id": "tg_ll_l_way",
    "hash": "a353df91",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_m_m_in": {
    "id": "tg_m_m_in",
    "hash": "f3f6eb65",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:m>m",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_m_m_like": {
    "id": "tg_m_m_like",
    "hash": "89fcc237",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:m>m",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_m_m_see": {
    "id": "tg_m_m_see",
    "hash": "76300d25",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:m>m",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_m_m_way": {
    "id": "tg_m_m_way",
    "hash": "30c6cea8",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:m>m",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_n_n_in": {
    "id": "tg_n_n_in",
    "hash": "73de1cff",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:n>n",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_n_n_like": {
    "id": "tg_n_n_like",
    "hash": "5928b27f",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_n_n_see": {
    "id": "tg_n_n_see",
    "hash": "348f4653",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_n_n_way": {
    "id": "tg_n_n_way",
    "hash": "b0ae0042",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:n>n",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ng_ng_in": {
    "id": "tg_ng_ng_in",
    "hash": "82f93093",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ng_ng_like": {
    "id": "tg_ng_ng_like",
    "hash": "f93e0161",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ng_ng_see": {
    "id": "tg_ng_ng_see",
    "hash": "86d2a8eb",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ng_ng_way": {
    "id": "tg_ng_ng_way",
    "hash": "5213e728",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ng>ng",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_o_o_in": {
    "id": "tg_o_o_in",
    "hash": "7c587212",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_o_o_like": {
    "id": "tg_o_o_like",
    "hash": "cc7f14f9",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_o_o_see": {
    "id": "tg_o_o_see",
    "hash": "22e46cbe",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_o_o_way": {
    "id": "tg_o_o_way",
    "hash": "22acde63",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:o>o",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_oa_oe_in": {
    "id": "tg_oa_oe_in",
    "hash": "f90b2263",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_oa_oe_like": {
    "id": "tg_oa_oe_like",
    "hash": "73e29a95",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_oa_oe_see": {
    "id": "tg_oa_oe_see",
    "hash": "f96fe31f",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_oa_oe_way": {
    "id": "tg_oa_oe_way",
    "hash": "738f5d9c",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:oa>oe",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ow_oe_in": {
    "id": "tg_ow_oe_in",
    "hash": "6932f100",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ow_oe_like": {
    "id": "tg_ow_oe_like",
    "hash": "01755ee4",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ow_oe_see": {
    "id": "tg_ow_oe_see",
    "hash": "ded9c9e7",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ow_oe_way": {
    "id": "tg_ow_oe_way",
    "hash": "509082a3",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ow>oe",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_p_p_in": {
    "id": "tg_p_p_in",
    "hash": "aa1eea9a",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_p_p_like": {
    "id": "tg_p_p_like",
    "hash": "7e475a65",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_p_p_see": {
    "id": "tg_p_p_see",
    "hash": "e9012636",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_p_p_way": {
    "id": "tg_p_p_way",
    "hash": "753fdb97",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:p>p",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_q_k_in": {
    "id": "tg_q_k_in",
    "hash": "30865311",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:q>k",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_q_k_like": {
    "id": "tg_q_k_like",
    "hash": "1fcefad7",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:q>k",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_q_k_see": {
    "id": "tg_q_k_see",
    "hash": "b9645ec1",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "term:spelling",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "gpc:q>k",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_q_k_way": {
    "id": "tg_q_k_way",
    "hash": "85ad1d00",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:q>k",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_r_r_in": {
    "id": "tg_r_r_in",
    "hash": "4430cac6",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:r>r",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_r_r_like": {
    "id": "tg_r_r_like",
    "hash": "d32e0914",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_r_r_see": {
    "id": "tg_r_r_see",
    "hash": "3c65ae6f",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:r>r",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_r_r_way": {
    "id": "tg_r_r_way",
    "hash": "d1cbc003",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:r>r",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_s_s_in": {
    "id": "tg_s_s_in",
    "hash": "58d3ac67",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_s_s_like": {
    "id": "tg_s_s_like",
    "hash": "de25d83b",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_s_s_see": {
    "id": "tg_s_s_see",
    "hash": "bc920c37",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_s_s_way": {
    "id": "tg_s_s_way",
    "hash": "48430842",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:s>s",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_sh_sh_in": {
    "id": "tg_sh_sh_in",
    "hash": "93bb4591",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_sh_sh_like": {
    "id": "tg_sh_sh_like",
    "hash": "8c96192b",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_sh_sh_see": {
    "id": "tg_sh_sh_see",
    "hash": "125c292f",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_sh_sh_way": {
    "id": "tg_sh_sh_way",
    "hash": "6d76373a",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:sh>sh",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ss_s_in": {
    "id": "tg_ss_s_in",
    "hash": "dc6bf6c6",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ss_s_like": {
    "id": "tg_ss_s_like",
    "hash": "7e85ea8c",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ss_s_see": {
    "id": "tg_ss_s_see",
    "hash": "e6910497",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_ss_s_way": {
    "id": "tg_ss_s_way",
    "hash": "0f77c413",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ss>s",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_t_t_in": {
    "id": "tg_t_t_in",
    "hash": "a0fd5688",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:t>t",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_t_t_like": {
    "id": "tg_t_t_like",
    "hash": "3d429694",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_t_t_see": {
    "id": "tg_t_t_see",
    "hash": "320e9e4d",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_t_t_way": {
    "id": "tg_t_t_way",
    "hash": "74b8880d",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:t>t",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_tch_ch_in": {
    "id": "tg_tch_ch_in",
    "hash": "413cbcc4",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:tch>ch",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_tch_ch_like": {
    "id": "tg_tch_ch_like",
    "hash": "073e716d",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_tch_ch_see": {
    "id": "tg_tch_ch_see",
    "hash": "af3ba97c",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_tch_ch_way": {
    "id": "tg_tch_ch_way",
    "hash": "008b4171",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:tch>ch",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_th_dh_in": {
    "id": "tg_th_dh_in",
    "hash": "47902df9",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:th>dh",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_th_dh_like": {
    "id": "tg_th_dh_like",
    "hash": "43df3f5e",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_th_dh_see": {
    "id": "tg_th_dh_see",
    "hash": "8aaf0a7e",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_th_dh_way": {
    "id": "tg_th_dh_way",
    "hash": "e91f01e2",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:th>dh",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_th_th_in": {
    "id": "tg_th_th_in",
    "hash": "a78d2e69",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:th>th",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_th_th_like": {
    "id": "tg_th_th_like",
    "hash": "e6250c21",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:th>th",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_th_th_see": {
    "id": "tg_th_th_see",
    "hash": "5836b389",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "term:spelling",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "gpc:th>th",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_th_th_way": {
    "id": "tg_th_th_way",
    "hash": "21673152",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:th>th",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_u_u_in": {
    "id": "tg_u_u_in",
    "hash": "2b4139b8",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:u>u",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_u_u_like": {
    "id": "tg_u_u_like",
    "hash": "085536f4",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_u_u_see": {
    "id": "tg_u_u_see",
    "hash": "6a3fc855",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_u_u_way": {
    "id": "tg_u_u_way",
    "hash": "53d72e55",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:u>u",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_u_w_in": {
    "id": "tg_u_w_in",
    "hash": "30865311",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:u>w",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_u_w_like": {
    "id": "tg_u_w_like",
    "hash": "8cf1feb3",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:u>w",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_u_w_see": {
    "id": "tg_u_w_see",
    "hash": "8668af71",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "term:spelling",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "gpc:u>w",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_u_w_way": {
    "id": "tg_u_w_way",
    "hash": "85ad1d00",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:u>w",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_v_v_in": {
    "id": "tg_v_v_in",
    "hash": "26daf02e",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:v>v",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_v_v_like": {
    "id": "tg_v_v_like",
    "hash": "5862b19b",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_v_v_see": {
    "id": "tg_v_v_see",
    "hash": "e87c4e16",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_v_v_way": {
    "id": "tg_v_v_way",
    "hash": "5a4706f3",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:v>v",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ve_v_in": {
    "id": "tg_ve_v_in",
    "hash": "7ab39533",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ve>v",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ve_v_like": {
    "id": "tg_ve_v_like",
    "hash": "161def90",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ve>v",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ve_v_see": {
    "id": "tg_ve_v_see",
    "hash": "c4545c23",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "term:spelling",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "gpc:ve>v",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_ve_v_way": {
    "id": "tg_ve_v_way",
    "hash": "defd1314",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:ve>v",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_w_w_in": {
    "id": "tg_w_w_in",
    "hash": "90c231f9",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:w>w",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_w_w_like": {
    "id": "tg_w_w_like",
    "hash": "209141ce",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_w_w_see": {
    "id": "tg_w_w_see",
    "hash": "a1774394",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_w_w_way": {
    "id": "tg_w_w_way",
    "hash": "8601b37c",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:w>w",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_wh_w_in": {
    "id": "tg_wh_w_in",
    "hash": "2d8b0607",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:wh>w",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_wh_w_like": {
    "id": "tg_wh_w_like",
    "hash": "0788f0b8",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:wh>w",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_wh_w_see": {
    "id": "tg_wh_w_see",
    "hash": "5e6a8160",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_wh_w_way": {
    "id": "tg_wh_w_way",
    "hash": "4a371136",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_y_y_in": {
    "id": "tg_y_y_in",
    "hash": "acc36db2",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:y>y",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_y_y_like": {
    "id": "tg_y_y_like",
    "hash": "91bf4d66",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_y_y_see": {
    "id": "tg_y_y_see",
    "hash": "2dbe1d2d",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_y_y_way": {
    "id": "tg_y_y_way",
    "hash": "587fdbd7",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:y>y",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_z_z_in": {
    "id": "tg_z_z_in",
    "hash": "45da7c4a",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:z>z",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_z_z_like": {
    "id": "tg_z_z_like",
    "hash": "904393bc",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_z_z_see": {
    "id": "tg_z_z_see",
    "hash": "ea4d03c5",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:z>z",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_z_z_way": {
    "id": "tg_z_z_way",
    "hash": "00f38857",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:z>z",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_zz_z_in": {
    "id": "tg_zz_z_in",
    "hash": "5e591082",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:zz>z",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tg_zz_z_like": {
    "id": "tg_zz_z_like",
    "hash": "3a2b2356",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_zz_z_see": {
    "id": "tg_zz_z_see",
    "hash": "a154fd43",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tg_zz_z_way": {
    "id": "tg_zz_z_way",
    "hash": "09a7a179",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "gpc:zz>z",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "that_says": {
    "id": "that_says",
    "hash": "bf2bf0cd",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "thats": {
    "id": "thats",
    "hash": "bf2bf0cd",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "this_is": {
    "id": "this_is",
    "hash": "3d633ec4",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "this_is_a": {
    "id": "this_is_a",
    "hash": "421da08d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "this_is_an": {
    "id": "this_is_an",
    "hash": "ac941c59",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "this_would_be": {
    "id": "this_would_be",
    "hash": "a771b226",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "three_letters_one_sound": {
    "id": "three_letters_one_sound",
    "hash": "6a6a78f1",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "three_sounds": {
    "id": "three_sounds",
    "hash": "ff3cb595",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "timer_intro_1": {
    "id": "timer_intro_1",
    "hash": "92381e7c",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:gems-fill-with-practice",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "timer_intro_2": {
    "id": "timer_intro_2",
    "hash": "f5b2970f",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "timer_intro_3": {
    "id": "timer_intro_3",
    "hash": "4e29b5b8",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_a_hear": {
    "id": "tp_a_hear",
    "hash": "cb07fe2b",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_a_list": {
    "id": "tp_a_list",
    "hash": "5edb9640",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_ae_hear": {
    "id": "tp_ae_hear",
    "hash": "fbf646e4",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:ae",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_ae_list": {
    "id": "tp_ae_list",
    "hash": "0af4772d",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "sound:ae",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tp_b_hear": {
    "id": "tp_b_hear",
    "hash": "ca6f8da6",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_b_list": {
    "id": "tp_b_list",
    "hash": "2c154571",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:b",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_ch_hear": {
    "id": "tp_ch_hear",
    "hash": "24c4a48c",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_ch_list": {
    "id": "tp_ch_list",
    "hash": "d2d5504f",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:ch",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_d_hear": {
    "id": "tp_d_hear",
    "hash": "48570752",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_d_list": {
    "id": "tp_d_list",
    "hash": "00ad7e03",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:d",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_dh_hear": {
    "id": "tp_dh_hear",
    "hash": "94d275f3",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "sound:dh",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tp_dh_list": {
    "id": "tp_dh_list",
    "hash": "c89176ba",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_e_hear": {
    "id": "tp_e_hear",
    "hash": "1d70644a",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_e_list": {
    "id": "tp_e_list",
    "hash": "9a71c545",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_ee_hear": {
    "id": "tp_ee_hear",
    "hash": "57d495f6",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:ee",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_ee_list": {
    "id": "tp_ee_list",
    "hash": "e6dfee31",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_f_hear": {
    "id": "tp_f_hear",
    "hash": "1dac1049",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_f_list": {
    "id": "tp_f_list",
    "hash": "edc58b92",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:f",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_g_hear": {
    "id": "tp_g_hear",
    "hash": "aafa90e7",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_g_list": {
    "id": "tp_g_list",
    "hash": "ef9265e2",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_h_hear": {
    "id": "tp_h_hear",
    "hash": "0b0bd3e8",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_h_list": {
    "id": "tp_h_list",
    "hash": "7e122c4f",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:h",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_i_hear": {
    "id": "tp_i_hear",
    "hash": "47c64078",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:i",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_i_list": {
    "id": "tp_i_list",
    "hash": "7cbd46e7",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_ie_hear": {
    "id": "tp_ie_hear",
    "hash": "82925a20",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:ie",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "sound:ie",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tp_ie_list": {
    "id": "tp_ie_list",
    "hash": "ecc7cf4b",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_j_hear": {
    "id": "tp_j_hear",
    "hash": "865585a6",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_j_list": {
    "id": "tp_j_list",
    "hash": "62c7117b",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:j",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_k_hear": {
    "id": "tp_k_hear",
    "hash": "5f890582",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_k_list": {
    "id": "tp_k_list",
    "hash": "283d8939",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_l_hear": {
    "id": "tp_l_hear",
    "hash": "082e6312",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_l_list": {
    "id": "tp_l_list",
    "hash": "166e896f",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_m_hear": {
    "id": "tp_m_hear",
    "hash": "cc507b18",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_m_list": {
    "id": "tp_m_list",
    "hash": "7cef74c3",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_n_hear": {
    "id": "tp_n_hear",
    "hash": "051934b4",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_n_list": {
    "id": "tp_n_list",
    "hash": "5728630d",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:n",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_ng_hear": {
    "id": "tp_ng_hear",
    "hash": "7395cd7c",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_ng_list": {
    "id": "tp_ng_list",
    "hash": "b192ac15",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_o_hear": {
    "id": "tp_o_hear",
    "hash": "7a2a3c26",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_o_list": {
    "id": "tp_o_list",
    "hash": "4bbd22ed",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_oe_hear": {
    "id": "tp_oe_hear",
    "hash": "30230ce0",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_oe_list": {
    "id": "tp_oe_list",
    "hash": "88c80875",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "sound:oe",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tp_p_hear": {
    "id": "tp_p_hear",
    "hash": "84234fcf",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_p_list": {
    "id": "tp_p_list",
    "hash": "1a67b704",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_r_hear": {
    "id": "tp_r_hear",
    "hash": "187f186b",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "sound:r",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tp_r_list": {
    "id": "tp_r_list",
    "hash": "e8c2b410",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:r",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_s_hear": {
    "id": "tp_s_hear",
    "hash": "a01435d3",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_s_list": {
    "id": "tp_s_list",
    "hash": "32341864",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_sh_hear": {
    "id": "tp_sh_hear",
    "hash": "e2734478",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_sh_list": {
    "id": "tp_sh_list",
    "hash": "04fb4eff",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:sh",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_t_hear": {
    "id": "tp_t_hear",
    "hash": "ba709afd",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:t",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_t_list": {
    "id": "tp_t_list",
    "hash": "9b50755a",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:t",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_th_hear": {
    "id": "tp_th_hear",
    "hash": "c99cc3e2",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_th_list": {
    "id": "tp_th_list",
    "hash": "daf13985",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [
      {
        "key": "sound:th",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tp_u_hear": {
    "id": "tp_u_hear",
    "hash": "81041ed3",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_u_list": {
    "id": "tp_u_list",
    "hash": "47076bd0",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:u",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_v_hear": {
    "id": "tp_v_hear",
    "hash": "4728a3c2",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:v",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "sound:v",
        "level": "explained"
      },
      {
        "key": "mech:replay-button",
        "level": "explained"
      },
      {
        "key": "idea:sounds-have-spellings",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tp_v_list": {
    "id": "tp_v_list",
    "hash": "0082f31b",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:v",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_w_hear": {
    "id": "tp_w_hear",
    "hash": "bdb9c157",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:w",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_w_list": {
    "id": "tp_w_list",
    "hash": "517b62ec",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:w",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_y_hear": {
    "id": "tp_y_hear",
    "hash": "ad398035",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:y",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_y_list": {
    "id": "tp_y_list",
    "hash": "f67e4c42",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tp_z_hear": {
    "id": "tp_z_hear",
    "hash": "20035681",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:z",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tp_z_list": {
    "id": "tp_z_list",
    "hash": "ad6d3b5c",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "sound:z",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tree_tap": {
    "id": "tree_tap",
    "hash": "be4eb1ab",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "obj:petal",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "trial_fail": {
    "id": "trial_fail",
    "hash": "3804b239",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "trial_start": {
    "id": "trial_start",
    "hash": "25bb629e",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "trial_win": {
    "id": "trial_win",
    "hash": "66fb11be",
    "who": "sensei",
    "purpose": "reward",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "turn_phone": {
    "id": "turn_phone",
    "hash": "d7bd99c5",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tut_1": {
    "id": "tut_1",
    "hash": "32a1217b",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tut_done": {
    "id": "tut_done",
    "hash": "69540ad1",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tut_good": {
    "id": "tut_good",
    "hash": "5649b2f9",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tut_help": {
    "id": "tut_help",
    "hash": "b5593715",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tut_help_ok": {
    "id": "tut_help_ok",
    "hash": "47a151f7",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tut_speaker": {
    "id": "tut_speaker",
    "hash": "8fc47124",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:replay-button",
        "as": "explain"
      },
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tut_stuck": {
    "id": "tut_stuck",
    "hash": "f1ac528e",
    "who": "sensei",
    "purpose": "hint",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tut_test": {
    "id": "tut_test",
    "hash": "3baf3f28",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "ask"
      }
    ],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      },
      {
        "key": "mech:tile-to-line",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tut_tile": {
    "id": "tut_tile",
    "hash": "e116e6ca",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "ask"
      },
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "ask"
      },
      {
        "key": "mech:tile-to-line",
        "as": "ask"
      }
    ],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      },
      {
        "key": "idea:middle-sound",
        "level": "explained"
      },
      {
        "key": "idea:one-line-per-sound",
        "level": "explained"
      },
      {
        "key": "mech:tile-to-line",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_and_another_way": {
    "id": "tv_and_another_way",
    "hash": "e9110b85",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_and_how_we_write": {
    "id": "tv_and_how_we_write",
    "hash": "6a712baa",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_another_sound": {
    "id": "tv_another_sound",
    "hash": "4455562f",
    "who": "sensei",
    "purpose": "transition",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:last-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_bar_down": {
    "id": "tv_bar_down",
    "hash": "97f03666",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_battle_again": {
    "id": "tv_battle_again",
    "hash": "f1f4d976",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_battle_card": {
    "id": "tv_battle_card",
    "hash": "385a9cb3",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_battle_frame": {
    "id": "tv_battle_frame",
    "hash": "2efe4c62",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_battle_go": {
    "id": "tv_battle_go",
    "hash": "40eb054e",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_battle_oh_no": {
    "id": "tv_battle_oh_no",
    "hash": "f2e8a974",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "char:baron",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_battle_ready": {
    "id": "tv_battle_ready",
    "hash": "b852e08f",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_battle_recap": {
    "id": "tv_battle_recap",
    "hash": "ea7d69e7",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [
      {
        "key": "idea:words-are-made-of-sounds",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_battle_why": {
    "id": "tv_battle_why",
    "hash": "b979512c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_boss_again": {
    "id": "tv_boss_again",
    "hash": "150bd7b4",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_boss_calm": {
    "id": "tv_boss_calm",
    "hash": "ef44686d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_boss_frame": {
    "id": "tv_boss_frame",
    "hash": "016ee5c9",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_boss_ready": {
    "id": "tv_boss_ready",
    "hash": "6cb26dcc",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_both_again": {
    "id": "tv_both_again",
    "hash": "a455f10f",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_build_again_3": {
    "id": "tv_build_again_3",
    "hash": "77d90d04",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_build_again_short": {
    "id": "tv_build_again_short",
    "hash": "ed7aca2d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_build_dojo": {
    "id": "tv_build_dojo",
    "hash": "34a89579",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_build_done": {
    "id": "tv_build_done",
    "hash": "0ef2b66e",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_build_frame": {
    "id": "tv_build_frame",
    "hash": "207ca442",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_build_lines": {
    "id": "tv_build_lines",
    "hash": "cadebb71",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_build_ready": {
    "id": "tv_build_ready",
    "hash": "f3ea9aa0",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_build_recap": {
    "id": "tv_build_recap",
    "hash": "b42574e6",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_by_yourself": {
    "id": "tv_by_yourself",
    "hash": "2b2bfdb3",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_by_yourself_build": {
    "id": "tv_by_yourself_build",
    "hash": "12d9cb7e",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_choose_hello": {
    "id": "tv_choose_hello",
    "hash": "6a036ebd",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "char:sensei",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_choose_ninja": {
    "id": "tv_choose_ninja",
    "hash": "334e4785",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_choose_q": {
    "id": "tv_choose_q",
    "hash": "f679454f",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "mech:tap-reader",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_choose_why": {
    "id": "tv_choose_why",
    "hash": "bdc9eda3",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "char:baron",
        "as": "explain"
      },
      {
        "key": "idea:first-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_dj_room": {
    "id": "tv_dj_room",
    "hash": "86c3a161",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_dojo_help_sound": {
    "id": "tv_dojo_help_sound",
    "hash": "afbe1588",
    "who": "sensei",
    "purpose": "model",
    "tags": [
      {
        "key": "mech:replay-button",
        "as": "mention"
      },
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:last-sound",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_dojo_idle_say": {
    "id": "tv_dojo_idle_say",
    "hash": "00773422",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_dojo_review_done": {
    "id": "tv_dojo_review_done",
    "hash": "69986736",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_dots_frame": {
    "id": "tv_dots_frame",
    "hash": "d59c23a5",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_dots_ido": {
    "id": "tv_dots_ido",
    "hash": "4d87dd07",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_dots_ready": {
    "id": "tv_dots_ready",
    "hash": "ba4767ad",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_dots_recap": {
    "id": "tv_dots_recap",
    "hash": "9d6c4827",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_dots_short": {
    "id": "tv_dots_short",
    "hash": "19baa82b",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_dots_word_ido": {
    "id": "tv_dots_word_ido",
    "hash": "1a66fd68",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ears_demo": {
    "id": "tv_ears_demo",
    "hash": "fce35222",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ears_frame": {
    "id": "tv_ears_frame",
    "hash": "d6e081c3",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ears_on": {
    "id": "tv_ears_on",
    "hash": "658392f8",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_film_arrow": {
    "id": "tv_film_arrow",
    "hash": "57a108b4",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_find_again_sock": {
    "id": "tv_find_again_sock",
    "hash": "9037b4b0",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_find_words_in": {
    "id": "tv_find_words_in",
    "hash": "d5d03535",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      },
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_find_write": {
    "id": "tv_find_write",
    "hash": "0fafcb04",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_first_again_known": {
    "id": "tv_first_again_known",
    "hash": "adba3b78",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_first_again_new": {
    "id": "tv_first_again_new",
    "hash": "5aa721d3",
    "who": "sensei",
    "purpose": "transition",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "mention"
      },
      {
        "key": "idea:first-sound",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      },
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_first_done": {
    "id": "tv_first_done",
    "hash": "b9e6d422",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_first_frame": {
    "id": "tv_first_frame",
    "hash": "069e5f0e",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "explain"
      },
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "explain"
      },
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_first_game": {
    "id": "tv_first_game",
    "hash": "a3d909b9",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_first_is": {
    "id": "tv_first_is",
    "hash": "a96c7cb6",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "ask"
      },
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_first_recap": {
    "id": "tv_first_recap",
    "hash": "4e8d8d90",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "explain"
      },
      {
        "key": "idea:first-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_first_sound": {
    "id": "tv_first_sound",
    "hash": "80496da3",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_fix_middle": {
    "id": "tv_fix_middle",
    "hash": "e3b7fd24",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_fix_start": {
    "id": "tv_fix_start",
    "hash": "fc34417d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_fix_together": {
    "id": "tv_fix_together",
    "hash": "e11b257b",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_flower_bye": {
    "id": "tv_flower_bye",
    "hash": "45930147",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_flower_petal": {
    "id": "tv_flower_petal",
    "hash": "cf2d796c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_flower_recap": {
    "id": "tv_flower_recap",
    "hash": "45606379",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "remind"
      },
      {
        "key": "idea:last-sound",
        "as": "remind"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "remind"
      }
    ],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_flower_tap": {
    "id": "tv_flower_tap",
    "hash": "436bd178",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_guess_again": {
    "id": "tv_guess_again",
    "hash": "a99b11c6",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_guess_frame": {
    "id": "tv_guess_frame",
    "hash": "77a90a15",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_guess_q": {
    "id": "tv_guess_q",
    "hash": "e6befc83",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_guess_recap": {
    "id": "tv_guess_recap",
    "hash": "597b6c5b",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_guess_short": {
    "id": "tv_guess_short",
    "hash": "bee9bd60",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_guess_so_sun": {
    "id": "tv_guess_so_sun",
    "hash": "a6013e9e",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_guess_together": {
    "id": "tv_guess_together",
    "hash": "8fbf16cb",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_hear_in_rain": {
    "id": "tv_hear_in_rain",
    "hash": "1643a959",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_hear_middle": {
    "id": "tv_hear_middle",
    "hash": "3bc41fbf",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_here_it_comes": {
    "id": "tv_here_it_comes",
    "hash": "e26f5fae",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_here_sound": {
    "id": "tv_here_sound",
    "hash": "1f0e402c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:last-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_how_we_write": {
    "id": "tv_how_we_write",
    "hash": "4b2ad0a7",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_hunt_again": {
    "id": "tv_hunt_again",
    "hash": "d7799ca1",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [
      {
        "key": "idea:last-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_hunt_done": {
    "id": "tv_hunt_done",
    "hash": "caa3209e",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_hunt_frame": {
    "id": "tv_hunt_frame",
    "hash": "17d1d8b1",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_hunt_q": {
    "id": "tv_hunt_q",
    "hash": "6188e233",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "ask"
      },
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "idea:last-sound",
        "as": "ask"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "ask"
      }
    ],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      },
      {
        "key": "idea:one-line-per-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_hunt_recap": {
    "id": "tv_hunt_recap",
    "hash": "aa8e285f",
    "who": "sensei",
    "purpose": "hint",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_i_hear_mug": {
    "id": "tv_i_hear_mug",
    "hash": "8e29c2ed",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_i_hear_sun": {
    "id": "tv_i_hear_sun",
    "hash": "73452506",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_i_say_slowly": {
    "id": "tv_i_say_slowly",
    "hash": "a58c7107",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_idle_look_sock": {
    "id": "tv_idle_look_sock",
    "hash": "90a7be6b",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_idle_point": {
    "id": "tv_idle_point",
    "hash": "6b3e0471",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ido_pair_bed_sock": {
    "id": "tv_ido_pair_bed_sock",
    "hash": "f00d4124",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ido_pair_bus_pig": {
    "id": "tv_ido_pair_bus_pig",
    "hash": "8e8ed33f",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ido_pair_cat_ant": {
    "id": "tv_ido_pair_cat_ant",
    "hash": "3b2c2d9e",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ido_pair_jam_tent": {
    "id": "tv_ido_pair_jam_tent",
    "hash": "351d588b",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ido_pair_map_hat": {
    "id": "tv_ido_pair_map_hat",
    "hash": "110f1388",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ido_pair_map_mop": {
    "id": "tv_ido_pair_map_mop",
    "hash": "9edfd6af",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ido_pair_nut_hat": {
    "id": "tv_ido_pair_nut_hat",
    "hash": "4d9807c3",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ido_pair_pan_pin": {
    "id": "tv_ido_pair_pan_pin",
    "hash": "73706b15",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_jump_offer": {
    "id": "tv_jump_offer",
    "hash": "8a1b2053",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_last_first": {
    "id": "tv_last_first",
    "hash": "3ce93be0",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_all_four": {
    "id": "tv_learn_all_four",
    "hash": "515ba2a0",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_all_three": {
    "id": "tv_learn_all_three",
    "hash": "f862ac18",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_all_two": {
    "id": "tv_learn_all_two",
    "hash": "de5a4f62",
    "who": "sensei",
    "purpose": "correction",
    "tags": [],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_learn_another": {
    "id": "tv_learn_another",
    "hash": "84e1beb6",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_done": {
    "id": "tv_learn_done",
    "hash": "19734a37",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_first": {
    "id": "tv_learn_first",
    "hash": "7e6fcd1f",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_first_short": {
    "id": "tv_learn_first_short",
    "hash": "20924ad4",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_frame_four": {
    "id": "tv_learn_frame_four",
    "hash": "46ccc6cf",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_frame_three": {
    "id": "tv_learn_frame_three",
    "hash": "69c8373d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_frame_two": {
    "id": "tv_learn_frame_two",
    "hash": "0d7fb6f3",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_frame_ways": {
    "id": "tv_learn_frame_ways",
    "hash": "5485a9c1",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_how": {
    "id": "tv_learn_how",
    "hash": "ebe08d60",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_last": {
    "id": "tv_learn_last",
    "hash": "079cec30",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:last-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_next": {
    "id": "tv_learn_next",
    "hash": "1303d987",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_ready": {
    "id": "tv_learn_ready",
    "hash": "291e686f",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_recap_four": {
    "id": "tv_learn_recap_four",
    "hash": "af335bd8",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_learn_recap_three": {
    "id": "tv_learn_recap_three",
    "hash": "992e682c",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_learn_recap_two": {
    "id": "tv_learn_recap_two",
    "hash": "701ad2a2",
    "who": "sensei",
    "purpose": "transition",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_learn_short_four": {
    "id": "tv_learn_short_four",
    "hash": "39883528",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_short_three": {
    "id": "tv_learn_short_three",
    "hash": "6512494c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_learn_short_two": {
    "id": "tv_learn_short_two",
    "hash": "af8dec12",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_let_me_listen": {
    "id": "tv_let_me_listen",
    "hash": "ddaebf3a",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_lets_check": {
    "id": "tv_lets_check",
    "hash": "7e3c7ff5",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_lets_say_read": {
    "id": "tv_lets_say_read",
    "hash": "89389383",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_listen_here": {
    "id": "tv_listen_here",
    "hash": "86655f10",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "mech:replay-button",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_listen_sound_again": {
    "id": "tv_listen_sound_again",
    "hash": "59eea0af",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_look_glow": {
    "id": "tv_look_glow",
    "hash": "cc722aac",
    "who": "sensei",
    "purpose": "hint",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_map_flower": {
    "id": "tv_map_flower",
    "hash": "adf563f2",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [
      {
        "key": "obj:world-flower",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_map_hint": {
    "id": "tv_map_hint",
    "hash": "11959537",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_map_intro": {
    "id": "tv_map_intro",
    "hash": "892f07c3",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_map_next_battle": {
    "id": "tv_map_next_battle",
    "hash": "e394536e",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "char:baron",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_map_next_boss": {
    "id": "tv_map_next_boss",
    "hash": "44adda61",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_map_next_build": {
    "id": "tv_map_next_build",
    "hash": "5b80b500",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_map_next_dots": {
    "id": "tv_map_next_dots",
    "hash": "a569aac7",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_map_next_firstsound": {
    "id": "tv_map_next_firstsound",
    "hash": "730b1570",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "mention"
      },
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_map_next_learn": {
    "id": "tv_map_next_learn",
    "hash": "a9cdd543",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_map_next_run": {
    "id": "tv_map_next_run",
    "hash": "6ada2fd9",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_map_next_sort": {
    "id": "tv_map_next_sort",
    "hash": "981ad61c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_map_next_soundhunt": {
    "id": "tv_map_next_soundhunt",
    "hash": "aea9dc8a",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_map_next_sounds": {
    "id": "tv_map_next_sounds",
    "hash": "982fb81f",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_map_next_story": {
    "id": "tv_map_next_story",
    "hash": "830e3958",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_map_next_swap": {
    "id": "tv_map_next_swap",
    "hash": "09ac2336",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "char:baron",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_mix_up": {
    "id": "tv_mix_up",
    "hash": "fa956bab",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_my_sounds": {
    "id": "tv_my_sounds",
    "hash": "770efd3c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_ne_again": {
    "id": "tv_ne_again",
    "hash": "97d141ad",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ne_frame": {
    "id": "tv_ne_frame",
    "hash": "49f695c8",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ne_new_sounds": {
    "id": "tv_ne_new_sounds",
    "hash": "9b6bb280",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "mention"
      },
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ne_recap": {
    "id": "tv_ne_recap",
    "hash": "100f5118",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_new_petal_say": {
    "id": "tv_new_petal_say",
    "hash": "2babde2d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_next_build": {
    "id": "tv_next_build",
    "hash": "082dce70",
    "who": "sensei",
    "purpose": "transition",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_next_build_plain": {
    "id": "tv_next_build_plain",
    "hash": "b5f554e1",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_next_game": {
    "id": "tv_next_game",
    "hash": "e4e5ef7f",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_next_middle": {
    "id": "tv_next_middle",
    "hash": "2a3aec75",
    "who": "sensei",
    "purpose": "hint",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_next_sound": {
    "id": "tv_next_sound",
    "hash": "424034d8",
    "who": "sensei",
    "purpose": "transition",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_next_sound_known": {
    "id": "tv_next_sound_known",
    "hash": "cbf99d62",
    "who": "sensei",
    "purpose": "transition",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      },
      {
        "key": "idea:middle-sound",
        "as": "mention"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_next_word": {
    "id": "tv_next_word",
    "hash": "2fd25ac8",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_not_in_middle": {
    "id": "tv_not_in_middle",
    "hash": "429fe333",
    "who": "sensei",
    "purpose": "hint",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "idea:one-line-per-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_notice_frame": {
    "id": "tv_notice_frame",
    "hash": "59c8164d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_now_find": {
    "id": "tv_now_find",
    "hash": "edd74d08",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_now_readers": {
    "id": "tv_now_readers",
    "hash": "a97ba345",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_now_say_word": {
    "id": "tv_now_say_word",
    "hash": "b89794c7",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_now_tap_hear_sock": {
    "id": "tv_now_tap_hear_sock",
    "hash": "4cbfcb21",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_now_your_turn": {
    "id": "tv_now_your_turn",
    "hash": "119ffabb",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_offer_show": {
    "id": "tv_offer_show",
    "hash": "90ac77d5",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_offer_show_miss": {
    "id": "tv_offer_show_miss",
    "hash": "779a081d",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_once_more": {
    "id": "tv_once_more",
    "hash": "26156f95",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_opt_again": {
    "id": "tv_opt_again",
    "hash": "1a98e9d1",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_opt_ask": {
    "id": "tv_opt_ask",
    "hash": "af0d50c5",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_opt_echo_notyet": {
    "id": "tv_opt_echo_notyet",
    "hash": "713fbb0a",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_opt_echo_school": {
    "id": "tv_opt_echo_school",
    "hash": "de683a1a",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_opt_grownups": {
    "id": "tv_opt_grownups",
    "hash": "8225aee6",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_opt_notyet": {
    "id": "tv_opt_notyet",
    "hash": "712330ea",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_opt_ok_notyet": {
    "id": "tv_opt_ok_notyet",
    "hash": "b149a082",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_opt_to_dojo": {
    "id": "tv_opt_to_dojo",
    "hash": "a0e88b9c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_opt_why": {
    "id": "tv_opt_why",
    "hash": "a981c05e",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_opt_yes": {
    "id": "tv_opt_yes",
    "hash": "21766981",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_our_word": {
    "id": "tv_our_word",
    "hash": "7af30e4e",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_petal_first": {
    "id": "tv_petal_first",
    "hash": "e92e907c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_petal_hint": {
    "id": "tv_petal_hint",
    "hash": "0252ee2d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:replay-button",
        "as": "explain"
      },
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_petal_say": {
    "id": "tv_petal_say",
    "hash": "db9cfeb5",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "obj:petal",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_petal_say_short": {
    "id": "tv_petal_say_short",
    "hash": "678abc90",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "obj:petal",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_place_done": {
    "id": "tv_place_done",
    "hash": "049ce61d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_place_findall_round": {
    "id": "tv_place_findall_round",
    "hash": "418e30f7",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_place_frame": {
    "id": "tv_place_frame",
    "hash": "cf8b2a09",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_place_ok": {
    "id": "tv_place_ok",
    "hash": "0292e3b0",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_place_sound_round": {
    "id": "tv_place_sound_round",
    "hash": "4712ff51",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_pocket_frame": {
    "id": "tv_pocket_frame",
    "hash": "c96ab044",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_pocket_ido": {
    "id": "tv_pocket_ido",
    "hash": "9fac27c7",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_pocket_middle": {
    "id": "tv_pocket_middle",
    "hash": "819c4d36",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_pocket_middle_more_o": {
    "id": "tv_pocket_middle_more_o",
    "hash": "7e89e73f",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_pocket_more_m": {
    "id": "tv_pocket_more_m",
    "hash": "d540050c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_pocket_more_s": {
    "id": "tv_pocket_more_s",
    "hash": "d540050c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_pocket_ready_three": {
    "id": "tv_pocket_ready_three",
    "hash": "b480c3c8",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_pocket_ready_two": {
    "id": "tv_pocket_ready_two",
    "hash": "38dd3bee",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_pocket_recap": {
    "id": "tv_pocket_recap",
    "hash": "4dc0f672",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_practise_again": {
    "id": "tv_practise_again",
    "hash": "e05b13a6",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_practise_gem": {
    "id": "tv_practise_gem",
    "hash": "7b962dc9",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_praise_built": {
    "id": "tv_praise_built",
    "hash": "9757bbcc",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_praise_found": {
    "id": "tv_praise_found",
    "hash": "c92411a9",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_praise_heard_word": {
    "id": "tv_praise_heard_word",
    "hash": "92773d64",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_praise_helped": {
    "id": "tv_praise_helped",
    "hash": "d31266b4",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_praise_judge": {
    "id": "tv_praise_judge",
    "hash": "bb99e721",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_praise_kept_going": {
    "id": "tv_praise_kept_going",
    "hash": "f2e274a5",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_praise_middle": {
    "id": "tv_praise_middle",
    "hash": "23c47f65",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_praise_order": {
    "id": "tv_praise_order",
    "hash": "ccc2e3f7",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_praise_read": {
    "id": "tv_praise_read",
    "hash": "c99e8e1c",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_praise_row": {
    "id": "tv_praise_row",
    "hash": "afa1b7e2",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_praise_slowly": {
    "id": "tv_praise_slowly",
    "hash": "905f25cc",
    "who": "sensei",
    "purpose": "praise",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_praise_sorted": {
    "id": "tv_praise_sorted",
    "hash": "a4d703b9",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_praise_squish": {
    "id": "tv_praise_squish",
    "hash": "99833e6e",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_praise_start": {
    "id": "tv_praise_start",
    "hash": "93dbc131",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_praise_swap": {
    "id": "tv_praise_swap",
    "hash": "73bbacc0",
    "who": "sensei",
    "purpose": "praise",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_praise_write": {
    "id": "tv_praise_write",
    "hash": "ae9c0e3d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      },
      {
        "key": "idea:middle-sound",
        "level": "explained"
      },
      {
        "key": "idea:last-sound",
        "level": "explained"
      },
      {
        "key": "idea:one-line-per-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_rail_again": {
    "id": "tv_rail_again",
    "hash": "02436d63",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_rail_frame": {
    "id": "tv_rail_frame",
    "hash": "b85aa9c1",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:left-to-right",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_rail_ido": {
    "id": "tv_rail_ido",
    "hash": "1d93d71c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_rail_ready": {
    "id": "tv_rail_ready",
    "hash": "b66f29da",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_rail_start": {
    "id": "tv_rail_start",
    "hash": "df18c19e",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_rail_turn": {
    "id": "tv_rail_turn",
    "hash": "f61aadb2",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_rail_yours": {
    "id": "tv_rail_yours",
    "hash": "c48424e3",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [
      {
        "key": "idea:say-the-sounds-read-the-word",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_rc_how": {
    "id": "tv_rc_how",
    "hash": "5db7faef",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_rc_q": {
    "id": "tv_rc_q",
    "hash": "f7f67276",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:left-to-right",
        "as": "ask"
      },
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_readers_back": {
    "id": "tv_readers_back",
    "hash": "d5083d4d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_readers_meet": {
    "id": "tv_readers_meet",
    "hash": "e6040479",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ready_first": {
    "id": "tv_ready_first",
    "hash": "e29fec4c",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ready_go": {
    "id": "tv_ready_go",
    "hash": "9ccbc297",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ready_help": {
    "id": "tv_ready_help",
    "hash": "e515829a",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ready_now": {
    "id": "tv_ready_now",
    "hash": "147e8cf1",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ready_paw": {
    "id": "tv_ready_paw",
    "hash": "5e164b90",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ready_to_watch": {
    "id": "tv_ready_to_watch",
    "hash": "4416ceb5",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ready_together": {
    "id": "tv_ready_together",
    "hash": "57a25595",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ready_yours": {
    "id": "tv_ready_yours",
    "hash": "60a6dbbf",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_rest": {
    "id": "tv_rest",
    "hash": "79db0f14",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_review_done": {
    "id": "tv_review_done",
    "hash": "9704d050",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_review_frame": {
    "id": "tv_review_frame",
    "hash": "716ba311",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_review_how": {
    "id": "tv_review_how",
    "hash": "7435e28f",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_review_short": {
    "id": "tv_review_short",
    "hash": "bffe294b",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_rhyme": {
    "id": "tv_rhyme",
    "hash": "2f5cd007",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_right_kai": {
    "id": "tv_right_kai",
    "hash": "ce5b5eec",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_right_suki": {
    "id": "tv_right_suki",
    "hash": "16029929",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_run_again": {
    "id": "tv_run_again",
    "hash": "73b2bd3b",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_run_fix": {
    "id": "tv_run_fix",
    "hash": "c8606586",
    "who": "sensei",
    "purpose": "correction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_run_frame": {
    "id": "tv_run_frame",
    "hash": "55cc2870",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_run_jump": {
    "id": "tv_run_jump",
    "hash": "7aa8c8e0",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_run_jump_ok": {
    "id": "tv_run_jump_ok",
    "hash": "36649d36",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_run_lanterns": {
    "id": "tv_run_lanterns",
    "hash": "8c306626",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_run_lanterns_how": {
    "id": "tv_run_lanterns_how",
    "hash": "c39f630b",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_run_read_first": {
    "id": "tv_run_read_first",
    "hash": "84a2975c",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_run_ready": {
    "id": "tv_run_ready",
    "hash": "50cb3508",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_run_which": {
    "id": "tv_run_which",
    "hash": "d7b20d88",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      },
      {
        "key": "idea:last-sound",
        "level": "explained"
      },
      {
        "key": "idea:say-the-sounds-read-the-word",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_rw_book": {
    "id": "tv_rw_book",
    "hash": "1c9acd76",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "obj:sticker-book",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_rw_every": {
    "id": "tv_rw_every",
    "hash": "b4972b6a",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "explain"
      },
      {
        "key": "obj:sticker-book",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_rw_fast_slow": {
    "id": "tv_rw_fast_slow",
    "hash": "0109a6ec",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_rw_link_book": {
    "id": "tv_rw_link_book",
    "hash": "b9bfabc4",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "obj:sticker-book",
        "as": "explain"
      },
      {
        "key": "idea:stickers-for-pictures",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_rw_next": {
    "id": "tv_rw_next",
    "hash": "b219ea8b",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_rw_tap": {
    "id": "tv_rw_tap",
    "hash": "fe3241a8",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_rw2_flower": {
    "id": "tv_rw2_flower",
    "hash": "4d03574b",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_rw2_tap_petal": {
    "id": "tv_rw2_tap_petal",
    "hash": "7f41fd16",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_said_well": {
    "id": "tv_said_well",
    "hash": "867ab0c4",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_same_word": {
    "id": "tv_same_word",
    "hash": "96ce5f9c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "explain"
      },
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_show_again": {
    "id": "tv_show_again",
    "hash": "835ac07d",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_show_offer": {
    "id": "tv_show_offer",
    "hash": "371eee05",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_show_offer_short": {
    "id": "tv_show_offer_short",
    "hash": "2208e8c8",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_silly": {
    "id": "tv_silly",
    "hash": "2094bedb",
    "who": "sensei",
    "purpose": "banter",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_slow_again": {
    "id": "tv_slow_again",
    "hash": "a99b11c6",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_slow_demo": {
    "id": "tv_slow_demo",
    "hash": "a59c36e7",
    "who": "sensei",
    "purpose": "model",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "mention"
      },
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_slow_frame": {
    "id": "tv_slow_frame",
    "hash": "23b2ca74",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "explain"
      },
      {
        "key": "idea:fast-and-slow-saying",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_slow_recap": {
    "id": "tv_slow_recap",
    "hash": "4614b3f3",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "explain"
      },
      {
        "key": "idea:fast-and-slow-saying",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_slow_short": {
    "id": "tv_slow_short",
    "hash": "3ed4ee0f",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "mention"
      }
    ],
    "needs": [
      {
        "key": "idea:fast-and-slow-saying",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_slow_yours": {
    "id": "tv_slow_yours",
    "hash": "018cbdb0",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_so_i_tap": {
    "id": "tv_so_i_tap",
    "hash": "94951330",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_so_pocket": {
    "id": "tv_so_pocket",
    "hash": "bfd7ad93",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_sort_done": {
    "id": "tv_sort_done",
    "hash": "334beee0",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_sort_fix": {
    "id": "tv_sort_fix",
    "hash": "cee6eee2",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "term:spelling",
        "as": "ask"
      },
      {
        "key": "idea:same-sound-different-spellings",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_sort_frame": {
    "id": "tv_sort_frame",
    "hash": "eff43c7a",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "term:spelling",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_sort_ido": {
    "id": "tv_sort_ido",
    "hash": "c97024cb",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_sort_open": {
    "id": "tv_sort_open",
    "hash": "81b95dec",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_sort_recap": {
    "id": "tv_sort_recap",
    "hash": "3eb9758e",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_sort_see": {
    "id": "tv_sort_see",
    "hash": "b97bb885",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "term:spelling",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_sort_so": {
    "id": "tv_sort_so",
    "hash": "efd3c35d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_spelt_like_this_bee": {
    "id": "tv_spelt_like_this_bee",
    "hash": "84c77d7d",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_spelt_like_this_boat": {
    "id": "tv_spelt_like_this_boat",
    "hash": "a98d7781",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_spelt_like_this_cat": {
    "id": "tv_spelt_like_this_cat",
    "hash": "0e609add",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_spelt_like_this_chick": {
    "id": "tv_spelt_like_this_chick",
    "hash": "7c08c5f1",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_spelt_like_this_duck": {
    "id": "tv_spelt_like_this_duck",
    "hash": "185f038c",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_spelt_like_this_kit": {
    "id": "tv_spelt_like_this_kit",
    "hash": "16e6ea4d",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_spelt_like_this_leaf": {
    "id": "tv_spelt_like_this_leaf",
    "hash": "0e49a5c3",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_spelt_like_this_light": {
    "id": "tv_spelt_like_this_light",
    "hash": "e19e2585",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_spelt_like_this_match": {
    "id": "tv_spelt_like_this_match",
    "hash": "f5f413b6",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_spelt_like_this_pie": {
    "id": "tv_spelt_like_this_pie",
    "hash": "31ee67eb",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_spelt_like_this_rain": {
    "id": "tv_spelt_like_this_rain",
    "hash": "9744d8e9",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_spelt_like_this_snow": {
    "id": "tv_spelt_like_this_snow",
    "hash": "0c7195f2",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_spelt_like_this_tray": {
    "id": "tv_spelt_like_this_tray",
    "hash": "3c6f7fbb",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_spelt_like_this_yak": {
    "id": "tv_spelt_like_this_yak",
    "hash": "f449b310",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_squish_again": {
    "id": "tv_squish_again",
    "hash": "1c074f11",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_squish_fast": {
    "id": "tv_squish_fast",
    "hash": "5623bc2e",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "obj:world-flower",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_squish_frame": {
    "id": "tv_squish_frame",
    "hash": "55470b8b",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_squish_ready": {
    "id": "tv_squish_ready",
    "hash": "6e9e1e95",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_squish_slow": {
    "id": "tv_squish_slow",
    "hash": "bb672211",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_story_begin": {
    "id": "tv_story_begin",
    "hash": "678e2f09",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_story_choice": {
    "id": "tv_story_choice",
    "hash": "92b7b369",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_story_frame": {
    "id": "tv_story_frame",
    "hash": "9aef28f3",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_story_help": {
    "id": "tv_story_help",
    "hash": "a9f6b2c8",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:help-button",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_story_q": {
    "id": "tv_story_q",
    "hash": "128fc04a",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_story_recap": {
    "id": "tv_story_recap",
    "hash": "4c0663c6",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_story_short": {
    "id": "tv_story_short",
    "hash": "d60b85fb",
    "who": "sensei",
    "purpose": "story",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_story_tick": {
    "id": "tv_story_tick",
    "hash": "0b86aa27",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_story_tick_idle": {
    "id": "tv_story_tick_idle",
    "hash": "6da44bfe",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_story_title": {
    "id": "tv_story_title",
    "hash": "915a916c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_story_together": {
    "id": "tv_story_together",
    "hash": "86bf6e9c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_story_yours": {
    "id": "tv_story_yours",
    "hash": "add70265",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_streak_10": {
    "id": "tv_streak_10",
    "hash": "d444bbfc",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_swap_again": {
    "id": "tv_swap_again",
    "hash": "40ee3c40",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_swap_both": {
    "id": "tv_swap_both",
    "hash": "748e2047",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_swap_change_to": {
    "id": "tv_swap_change_to",
    "hash": "51b065f2",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_swap_done": {
    "id": "tv_swap_done",
    "hash": "5056eacc",
    "who": "sensei",
    "purpose": "praise",
    "tags": [
      {
        "key": "char:baron",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_swap_frame": {
    "id": "tv_swap_frame",
    "hash": "d6e8c52e",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_swap_in": {
    "id": "tv_swap_in",
    "hash": "8fe433c2",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_swap_kick": {
    "id": "tv_swap_kick",
    "hash": "68ff3361",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_swap_now_change": {
    "id": "tv_swap_now_change",
    "hash": "e0d843f1",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_swap_oh_dear": {
    "id": "tv_swap_oh_dear",
    "hash": "0b1aa7be",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "char:baron",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_swap_pick": {
    "id": "tv_swap_pick",
    "hash": "7536f83c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_swap_read_first": {
    "id": "tv_swap_read_first",
    "hash": "44acc4a7",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_swap_ready": {
    "id": "tv_swap_ready",
    "hash": "0147cc67",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_take_time": {
    "id": "tv_take_time",
    "hash": "86192883",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_tap_hear_sun": {
    "id": "tv_tap_hear_sun",
    "hash": "e2ede273",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_tap_it_say": {
    "id": "tv_tap_it_say",
    "hash": "4d8ed1dd",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_tap_it_say_short": {
    "id": "tv_tap_it_say_short",
    "hash": "d8ed2ce8",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_tap_letter_say": {
    "id": "tv_tap_letter_say",
    "hash": "4d8ed1dd",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_thats_write": {
    "id": "tv_thats_write",
    "hash": "3447cca4",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_to_flower": {
    "id": "tv_to_flower",
    "hash": "5c1d05a6",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "obj:world-flower",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_to_flower_first": {
    "id": "tv_to_flower_first",
    "hash": "e0c846c1",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_to_reward": {
    "id": "tv_to_reward",
    "hash": "2aeccf4f",
    "who": "sensei",
    "purpose": "reward",
    "tags": [
      {
        "key": "char:baron",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_together": {
    "id": "tv_together",
    "hash": "87b72d9a",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_train_done": {
    "id": "tv_train_done",
    "hash": "7fc19e59",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_train_gong": {
    "id": "tv_train_gong",
    "hash": "0c6e2e46",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_train_gong_ok": {
    "id": "tv_train_gong_ok",
    "hash": "e9845a57",
    "who": "sensei",
    "purpose": "reward",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_train_hear_again": {
    "id": "tv_train_hear_again",
    "hash": "6278c148",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:replay-button",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_train_hello": {
    "id": "tv_train_hello",
    "hash": "e568d475",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "term:dojo",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_train_help": {
    "id": "tv_train_help",
    "hash": "e1db0ffb",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_train_speaker": {
    "id": "tv_train_speaker",
    "hash": "4d923416",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_train_speaker_ok": {
    "id": "tv_train_speaker_ok",
    "hash": "0de37fd5",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_train_tricks": {
    "id": "tv_train_tricks",
    "hash": "2ea14943",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_train_try_help": {
    "id": "tv_train_try_help",
    "hash": "83b2bd31",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_trial_bar": {
    "id": "tv_trial_bar",
    "hash": "f4fa8cbe",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [
      {
        "key": "idea:one-line-per-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_trial_frame": {
    "id": "tv_trial_frame",
    "hash": "e14afa28",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_trial_heart": {
    "id": "tv_trial_heart",
    "hash": "bee1c195",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_trial_ready": {
    "id": "tv_trial_ready",
    "hash": "5ea7d5e7",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_trial_short": {
    "id": "tv_trial_short",
    "hash": "8458a45d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ts_again": {
    "id": "tv_ts_again",
    "hash": "edb6e200",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ts_fast": {
    "id": "tv_ts_fast",
    "hash": "0a5aac9c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ts_meet": {
    "id": "tv_ts_meet",
    "hash": "71a59b79",
    "who": "sensei",
    "purpose": "naming",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ts_slow": {
    "id": "tv_ts_slow",
    "hash": "10507762",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ts_slow_one": {
    "id": "tv_ts_slow_one",
    "hash": "3949e2dd",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ts_wrong_rabbit": {
    "id": "tv_ts_wrong_rabbit",
    "hash": "a4c30f45",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_ts_wrong_tortoise": {
    "id": "tv_ts_wrong_tortoise",
    "hash": "f5cbba69",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:fast-and-slow-saying",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_turn_again": {
    "id": "tv_turn_again",
    "hash": "846c8183",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_w1_end": {
    "id": "tv_w1_end",
    "hash": "5ecf4e42",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_w3_done": {
    "id": "tv_w3_done",
    "hash": "f8386ee0",
    "who": "sensei",
    "purpose": "praise",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_w4_done": {
    "id": "tv_w4_done",
    "hash": "44585504",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_w5_done": {
    "id": "tv_w5_done",
    "hash": "d2ffcd95",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_watch_write": {
    "id": "tv_watch_write",
    "hash": "637e10d3",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_welcome_back": {
    "id": "tv_welcome_back",
    "hash": "d9e90dce",
    "who": "sensei",
    "purpose": "banter",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_which_again": {
    "id": "tv_which_again",
    "hash": "dc227dfd",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_which_changes": {
    "id": "tv_which_changes",
    "hash": "a6a49f4a",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "ask"
      },
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "idea:last-sound",
        "as": "ask"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_which_demo": {
    "id": "tv_which_demo",
    "hash": "850ca564",
    "who": "sensei",
    "purpose": "model",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_which_fix_cat_dog": {
    "id": "tv_which_fix_cat_dog",
    "hash": "6b539389",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_which_fix_fish_dog_cat": {
    "id": "tv_which_fix_fish_dog_cat",
    "hash": "7c3b4c1f",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_which_frame": {
    "id": "tv_which_frame",
    "hash": "c51529d5",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_which_q_cat_dog": {
    "id": "tv_which_q_cat_dog",
    "hash": "509f1f3b",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_which_q_fish_dog_cat": {
    "id": "tv_which_q_fish_dog_cat",
    "hash": "515dfd9f",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:say-the-sounds-read-the-word",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_which_so": {
    "id": "tv_which_so",
    "hash": "dbe55d84",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_which_starts_it": {
    "id": "tv_which_starts_it",
    "hash": "2bb5d114",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "mech:tap-picture",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_which_way_write_it": {
    "id": "tv_which_way_write_it",
    "hash": "d13488fe",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_which_write": {
    "id": "tv_which_write",
    "hash": "aa1289e6",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_won_four": {
    "id": "tv_won_four",
    "hash": "44ce00f6",
    "who": "sensei",
    "purpose": "reward",
    "tags": [],
    "needs": [
      {
        "key": "idea:words-are-made-of-sounds",
        "level": "explained"
      },
      {
        "key": "idea:first-sound",
        "level": "explained"
      },
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_won_one": {
    "id": "tv_won_one",
    "hash": "b713671e",
    "who": "sensei",
    "purpose": "reward",
    "tags": [],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      },
      {
        "key": "idea:middle-sound",
        "level": "explained"
      },
      {
        "key": "idea:last-sound",
        "level": "explained"
      },
      {
        "key": "idea:one-line-per-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_won_three": {
    "id": "tv_won_three",
    "hash": "5c76634a",
    "who": "sensei",
    "purpose": "reward",
    "tags": [],
    "needs": [
      {
        "key": "idea:words-are-made-of-sounds",
        "level": "explained"
      },
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_won_two": {
    "id": "tv_won_two",
    "hash": "7c2bfed0",
    "who": "sensei",
    "purpose": "reward",
    "tags": [],
    "needs": [
      {
        "key": "idea:first-sound",
        "level": "explained"
      },
      {
        "key": "idea:middle-sound",
        "level": "explained"
      }
    ],
    "repetition": "routine"
  },
  "tv_word_card": {
    "id": "tv_word_card",
    "hash": "863aea10",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "mech:replay-button",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_word_hunt_frame": {
    "id": "tv_word_hunt_frame",
    "hash": "36ff817f",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_x_two_sounds": {
    "id": "tv_x_two_sounds",
    "hash": "71e22252",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_yay_lovely": {
    "id": "tv_yay_lovely",
    "hash": "b3adc10c",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_yay_thats_it": {
    "id": "tv_yay_thats_it",
    "hash": "045cb455",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_yes_kai": {
    "id": "tv_yes_kai",
    "hash": "9afcde7a",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_yes_suki": {
    "id": "tv_yes_suki",
    "hash": "0cd467c7",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_you_find_last": {
    "id": "tv_you_find_last",
    "hash": "ed6f3280",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:last-sound",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_you_read_first": {
    "id": "tv_you_read_first",
    "hash": "e4943e06",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:middle-sound",
        "as": "explain"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "tv_your_word": {
    "id": "tv_your_word",
    "hash": "61db44b9",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "tv_your_word_sock": {
    "id": "tv_your_word_sock",
    "hash": "128cf0cf",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "two_letters_one_sound": {
    "id": "two_letters_one_sound",
    "hash": "89ca2693",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "two_sounds": {
    "id": "two_sounds",
    "hash": "45ea722b",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "we_need": {
    "id": "we_need",
    "hash": "1dde927c",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "wedo": {
    "id": "wedo",
    "hash": "2647ab72",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "welcome_back": {
    "id": "welcome_back",
    "hash": "3578e4ff",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "well_read": {
    "id": "well_read",
    "hash": "6df7c475",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "vary"
  },
  "well_spelt": {
    "id": "well_spelt",
    "hash": "f55da0a3",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "vary"
  },
  "what_changed": {
    "id": "what_changed",
    "hash": "213843d8",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [
      {
        "key": "idea:change-one-sound",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "which_sound": {
    "id": "which_sound",
    "hash": "0680e84f",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [
      {
        "key": "idea:first-sound",
        "as": "ask"
      },
      {
        "key": "idea:middle-sound",
        "as": "ask"
      },
      {
        "key": "idea:one-line-per-sound",
        "as": "ask"
      },
      {
        "key": "mech:tile-to-line",
        "as": "ask"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "words_made": {
    "id": "words_made",
    "hash": "95d4157b",
    "who": "sensei",
    "purpose": "explanation",
    "tags": [
      {
        "key": "idea:words-are-made-of-sounds",
        "as": "explain"
      },
      {
        "key": "idea:middle-sound",
        "as": "explain"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "world_1": {
    "id": "world_1",
    "hash": "6ea6f780",
    "who": "sensei",
    "purpose": "exposition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "world_2": {
    "id": "world_2",
    "hash": "4aa4a23d",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "world_3": {
    "id": "world_3",
    "hash": "7e23a25c",
    "who": "sensei",
    "purpose": "exposition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "world_4": {
    "id": "world_4",
    "hash": "608b523b",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "world_5": {
    "id": "world_5",
    "hash": "e85dc754",
    "who": "sensei",
    "purpose": "instruction",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "world_6": {
    "id": "world_6",
    "hash": "a50c2d8a",
    "who": "sensei",
    "purpose": "exposition",
    "tags": [
      {
        "key": "char:baron",
        "as": "mention"
      }
    ],
    "needs": [],
    "repetition": "routine"
  },
  "world_done": {
    "id": "world_done",
    "hash": "e412bb87",
    "who": "sensei",
    "purpose": "transition",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  },
  "yay_1": {
    "id": "yay_1",
    "hash": "e69eddb0",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "vary"
  },
  "yay_10": {
    "id": "yay_10",
    "hash": "f90bc284",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "vary"
  },
  "yay_2": {
    "id": "yay_2",
    "hash": "88ce442c",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "vary"
  },
  "yay_3": {
    "id": "yay_3",
    "hash": "96b4c79e",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "vary"
  },
  "yay_4": {
    "id": "yay_4",
    "hash": "366ea718",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "vary"
  },
  "yay_5": {
    "id": "yay_5",
    "hash": "2ef6e274",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "vary"
  },
  "yay_6": {
    "id": "yay_6",
    "hash": "01e3586a",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "vary"
  },
  "yay_7": {
    "id": "yay_7",
    "hash": "1daa4c54",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "vary"
  },
  "yay_8": {
    "id": "yay_8",
    "hash": "0db456de",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "vary"
  },
  "yay_9": {
    "id": "yay_9",
    "hash": "fed2e0c1",
    "who": "sensei",
    "purpose": "praise",
    "tags": [],
    "needs": [],
    "repetition": "vary"
  },
  "youdo": {
    "id": "youdo",
    "hash": "0e9ff602",
    "who": "sensei",
    "purpose": "prompt",
    "tags": [],
    "needs": [],
    "repetition": "routine"
  }
};
