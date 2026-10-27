# worksheet: interactive worksheets

One table: Field:name | Value | Unit | Hint. The first column names the Value cell for formulas.
Values starting with = are calculated outputs; other values are editable. Unit is text, check, number, or a displayed unit such as g.
Paragraphs provide instructions and task-list items are live checkboxes. Share an updated link to share the filled worksheet.

Decision scorecard:

```
---
title: Should we build it?
---
Score each factor from 1 to 5. The weights favor usefulness over novelty.

Field:name | Value | Unit | Hint
--- | --- | --- | ---
Usefulness | 4 | number | How much does this help?
Confidence | 3 | number | How certain are we?
Ease | 4 | number | 5 means easiest to deliver
Score | =ROUND((USEFULNESS*3+CONFIDENCE*2+EASE)/6,2) | / 5 | Weighted result

- [ ] Talk to one person who would use this.
- [ ] Write the smallest next step.
```

As a link: <https://office.thin-sky.cloud/worksheet/#doc=---%0Atitle%3A+Should+we+build+it%3F%0A---%0AScore+each+factor+from+1+to+5.+The+weights+favor+usefulness+over+novelty.%0A%0AField%3Aname+%7C+Value+%7C+Unit+%7C+Hint%0A---+%7C+---+%7C+---+%7C+---%0AUsefulness+%7C+4+%7C+number+%7C+How+much+does+this+help%3F%0AConfidence+%7C+3+%7C+number+%7C+How+certain+are+we%3F%0AEase+%7C+4+%7C+number+%7C+5+means+easiest+to+deliver%0AScore+%7C+%3DROUND%28%28USEFULNESS%2A3%2BCONFIDENCE%2A2%2BEASE%29%2F6%2C2%29+%7C+%2F+5+%7C+Weighted+result%0A%0A-+%5B+%5D+Talk+to+one+person+who+would+use+this.%0A-+%5B+%5D+Write+the+smallest+next+step.>

Templates: Decision scorecard, Recipe card, Adventure sheet.
