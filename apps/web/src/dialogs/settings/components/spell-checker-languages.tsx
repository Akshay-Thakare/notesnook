/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2023 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { Language, useSpellChecker } from "../../../hooks/use-spell-checker";
import { Checkbox, Input, Label } from "@theme-ui/components";
import { useCallback, useEffect, useState } from "react";
import { deleteItem } from "@notesnook/core/utils/array";

export function SpellCheckerLanguages() {
  const spellChecker = useSpellChecker();
  const [enabledLanguages, setEnabledLanguages] = useState<string[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  useEffect(() => {
    if (!spellChecker.enabledLanguages || !spellChecker.languages) return;

    setEnabledLanguages(spellChecker.enabledLanguages.map((a) => a.code));
    setLanguages(spellChecker.languages.slice());
  }, [spellChecker.enabledLanguages, spellChecker.languages]);

  const filter = useCallback(
    async (query) => {
      if (!spellChecker.languages) return;
      setLanguages(
        spellChecker.languages.filter(
          (a) =>
            a.name.toLowerCase().includes(query) ||
            a.code.toLowerCase().includes(query)
        )
      );
    },
    [spellChecker]
  );

  return (
    <>
      <Input
        placeholder="Filter languages"
        sx={{ mx: "2px", my: 2, width: "auto" }}
        onChange={(e) => filter(e.currentTarget.value.toLowerCase().trim())}
      />
      {languages.map((lang) => (
        <Label key={lang.code} variant="text.body" sx={{ mb: 1 }}>
          <Checkbox
            checked={enabledLanguages.includes(lang.code)}
            onChange={async (e) => {
              const { checked } = e.currentTarget;
              const copiedLanguages = enabledLanguages.slice();

              if (checked) copiedLanguages.push(lang.code);
              else deleteItem(copiedLanguages, lang.code);

              await spellChecker.setLanguages(copiedLanguages);
            }}
            sx={{ mr: 1, width: 20, height: 20 }}
          />
          {lang.name}
        </Label>
      ))}
    </>
  );
}
