export type Locale = 'ko' | 'en';
export type Copy = { ko: string; en: string };
export type Checkpoint = { at: number; title: Copy; check: Copy };
export type LessonCase = { id: string; title: Copy; when: Copy; hold: Copy; moves: string; targetSetup?: string; steps: Copy[]; after: Copy; checkpoints: Checkpoint[] };
export type Lesson = { slug: string; title: Copy; shortTitle: Copy; goal: Copy; intro: Copy; hold: Copy; check: Copy; tips: Copy[]; help: Copy; cases: LessonCase[] };

const c = (ko: string, en: string): Copy => ({ ko, en });
export function text(copy: Copy, locale: Locale): string { return copy[locale]; }

const faces: Record<string, Copy> = {
  U: c('윗면', 'top face'), D: c('아랫면', 'bottom face'),
  F: c('앞면', 'front face'), B: c('뒷면', 'back face'),
  R: c('오른쪽 면', 'right face'), L: c('왼쪽 면', 'left face'),
};

// 각 동작의 설명은 그 면을 정면에서 바라보는 방향을 기준으로 만든다.
function instructions(moves: string): Copy[] {
  return moves.split(/\s+/).map((move) => {
    const face = faces[move[0]]!;
    if (move.endsWith('2')) return c(`${face.ko}만 반 바퀴 돌려요.`, `Turn only the ${face.en} halfway.`);
    const reverse = move.endsWith("'");
    return c(
      `${face.ko}을 정면으로 보고, 그 면을 ${reverse ? '반시계' : '시계'} 방향으로 한 칸 돌려요.`,
      `Look straight at the ${face.en}. Turn only that face a quarter turn ${reverse ? 'counterclockwise' : 'clockwise'}.`,
    );
  });
}

function example(id: string, title: Copy, when: Copy, hold: Copy, moves: string, after: Copy, targetSetup?: string): LessonCase {
  return { id, title, when, hold, moves, steps: instructions(moves), after,
    checkpoints: [{ at: moves.trim().split(/\s+/).length, title: c('동작 뒤 확인', 'Check after the moves'), check: after }],
    ...(targetSetup ? { targetSetup } : {}) };
}

const hold = c('노란 가운데는 위, 흰 가운데는 아래예요. 시작할 때 고른 앞면을 동작 묶음이 끝날 때까지 지켜요.', 'Keep the yellow center up and the white center down. Keep the same front until the whole move sequence ends.');
const demoHold = c('시연은 초록 가운데가 앞, 빨간 가운데가 오른쪽이에요. 실물은 조각에 맞춰 앞면을 골라도 돼요.', 'In the demo, green is front and red is right. On your cube, choose the front that fits the piece.');
const T = "R U R' U'";
const A = "F R U R' U' F'";
const E = "R U R' U R U2 R' U";
const C = "U R U' L' U R' U' L";
const Q = "R' D' R D";
const repeat = (moves: string, count: number): string => Array(count).fill(moves).join(' ');
const finishMoves = (groups: number) => repeat(Q, groups) + ' U ' + repeat(Q, 6 - groups) + " U'";
const finishHold = c('노랑은 위, 초록은 앞이에요. 시작한 앞면을 끝까지 유지하고, 다음 꼭짓점은 윗면만 돌려 가져와요.', 'Keep yellow up and green front throughout. Bring the next corner over by turning only the top.');
const finishAfter = c('예시의 여섯 면이 맞았어요. 실물도 남은 꼭짓점을 돌린 뒤 윗층을 정렬하고 여섯 면을 확인해요.', 'All six example faces are solved. On your cube, finish every remaining corner, align the top, and check all six faces.');
const daisy = 'F2 R2 B2 L2';
const rightInsert = "U R U' R' U' F' U F";
const leftInsert = "U' L' U L U F U' F'";

const lessonLibrary: Lesson[] = [
  {
    slug: 'ready', title: c('큐브의 조각과 방향', 'Cube pieces and orientation'), shortTitle: c('준비', 'Get ready'),
    goal: c('두 색 조각과 세 색 조각을 구분해요.', 'Find centers, edges, and corners.'),
    intro: c('각 면의 가운데 조각이 그 면의 색을 정해요. 두 색이 붙은 조각은 모서리, 세 색이 붙은 조각은 꼭짓점이에요.', 'Bring a physical 3×3 cube. An edge has two colors; a corner has three. Each center names its face.'),
    hold, check: c('노란 가운데를 위에 두고, 두 색 조각 하나와 세 색 조각 하나를 가리킬 수 있나요?', 'Can you keep the yellow center up and point to one two-color edge and one three-color corner?'),
    tips: [
      c('화면은 연습 예시예요. 내 큐브의 색 배치를 읽거나 알아맞히지 않아요.', 'The screen is a practice example. It does not read or recognize your cube.'),
      c('F 앞, B 뒤, R 오른쪽, L 왼쪽, U 위, D 아래. 글자는 그 면만 돌리라는 뜻이에요.', 'F front, B back, R right, L left, U up, D down. A letter turns only that face.'),
      c("작은 따옴표(')는 거꾸로, 2는 반 바퀴예요. 시계 방향은 돌릴 면을 바라볼 때의 방향이에요.", "A prime (') means reverse; 2 means a half turn. Clockwise is seen looking straight at the face you turn."),
    ],
    help: c('노란 가운데를 위로, 흰 가운데를 아래로 잡아요. 앞면은 지금 내 쪽을 보는 면이에요. 큐브 전체를 돌려 잡는 것과 한 면만 돌리는 것은 달라요. 움직이는 모습을 보고 차이를 확인해요.', 'Start by checking your grip and the face names. Green front/red right is the demo convention; your cube may have a different color scheme. Do not remove pieces or move stickers. Compare after a whole sequence. Back and Replay change only the screen. To undo physical moves, reverse their order and direction on the real cube. Take a break whenever needed.'),
    cases: [example('turn-and-return', c('앞면을 돌렸다 돌아와요', 'Turn the front and come back'), c('면 하나만 움직이는 연습을 하고 싶어요.', 'You want to practice moving one face.'), demoHold, "F F'", c('앞면이 원래대로 돌아왔나요? 이제 두 색 모서리를 찾아요.', 'Did the front return to where it started? Now find a two-color edge.'))],
  },
  {
    slug: 'daisy', title: c('흰 조각을 위로 모으는 방법', 'Make a white daisy around yellow'), shortTitle: c('흰 꽃', 'Daisy'),
    goal: c('노란 가운데 둘레에 흰 조각 네 개를 모아요.', 'Put four white edges around the yellow center.'),
    intro: c('흰 십자를 만들기 위한 보조 방법이에요. 흰색이 있는 두 색 조각을 찾아 위로 올려요. 네 개가 모이면 흰 십자 수업으로 돌아가요.', 'Leave the white corners for later. Find only two-color edges with white and bring them up, one at a time.'),
    hold, check: c('윗면 가운데는 노랑, 그 둘레 네 모서리는 흰색인가요? 꽃잎의 옆 색은 아직 달라도 돼요.', 'Is the top center yellow with four white edge petals around it? Their side colors can differ for now.'),
    tips: [c('새 꽃잎이 들어갈 자리가 비어 있게 U로 윗층을 돌려요.', 'Use U turns to leave an empty top spot for a new petal.'), c('이미 만든 꽃잎을 치우게 되면 멈춰요. 먼저 윗층을 돌려 자리를 비워요.', 'If a move would knock out a petal, stop. Turn the top to free that spot first.')],
    help: c('노란 가운데를 위로 잡아요. 흰색이 있는 두 색 조각을 찾고 아래 사례에서 같은 위치를 골라요. 올릴 자리에 다른 흰 조각이 있으면 윗면만 돌려 빈자리를 만들어요. 흰색이 옆을 보는 아래 조각은 먼저 가운데 층으로 꺼낸 뒤, 새 위치에 맞는 사례를 골라요.', 'These cases show local petal moves. On the real cube, use U turns to free the destination and any top edge a face turn would disturb. A lower white edge facing sideways first moves into the middle layer; then choose its new matching case. Continue only when all four white edges face up. Other petals in the demonstrations have been prepared in advance.'),
    cases: [
      example('bottom', c('흰색이 아래를 봐요', 'White faces down'), c('앞·아래 모서리의 흰색이 아래를 보고, 앞·위 꽃잎 자리가 비어 있어요.', 'White faces down on the front-bottom edge, and the front-top petal spot is free.'), c('찾은 모서리를 앞·아래에 둬요. 노란 가운데는 위예요.', 'Put that edge at front-bottom. Keep the yellow center up.'), 'F2', c('흰색이 위로 왔어요. 남은 흰 모서리를 찾아 네 꽃잎이 될 때까지 반복해요.', 'White is on top. Find another white edge and repeat until there are four petals.'), daisy),
      example('middle-front', c('가운데 층에서 앞을 봐요', 'White faces front in the middle'), c('앞·오른쪽 모서리의 흰색이 앞을 보고, 위·오른쪽 꽃잎 자리가 비어 있어요.', 'White faces front on the front-right edge, and the top-right petal spot is free.'), demoHold, 'R', c('흰 꽃잎 하나가 위로 왔어요. 다른 모서리를 골라요.', 'One white petal moved up. Choose another edge.'), daisy),
      example('middle-right', c('가운데 층에서 옆을 봐요', 'White faces right in the middle'), c('앞·오른쪽 모서리의 흰색이 오른쪽을 보고, 위·앞 꽃잎 자리가 비어 있어요.', 'White faces right on the front-right edge, and the top-front petal spot is free.'), demoHold, "F'", c('흰 꽃잎 하나가 위로 왔어요. 네 꽃잎을 확인해요.', 'One white petal moved up. Check for all four petals.'), daisy),
      example('lower-side', c('아래 조각이 앞을 봐요', 'A lower edge faces front'), c('앞·아래 모서리의 흰색이 앞을 봐요. 앞·위에는 흰 꽃잎이 없어요.', 'White faces front on the front-bottom edge. There is no white petal at front-top.'), demoHold, 'F', c('흰 모서리가 앞·왼쪽 가운데 층으로 나왔어요. 큐브 전체를 옆으로 돌려 그 조각을 앞·오른쪽에 둔 뒤 맞는 가운데 층 사례를 골라요.', 'The white edge is now at front-left in the middle layer. Regrip the whole cube to put it at front-right, then choose the matching middle-layer case.'), daisy + ' L'),
      example('top-side', c('윗층에서 흰색이 옆을 봐요', 'White faces sideways on a top edge'), c('위·앞 모서리의 흰색이 앞을 봐요. 다른 세 꽃잎이 이미 모여 있어도 이 방법을 쓸 수 있어요.', 'White faces front on the top-front edge. This method works even when the other three petals are already gathered.'), c('노란 가운데는 위, 흰색이 옆을 보는 모서리는 위·앞에 둬요. 앞면을 유지하고 F → U′ → R 순서로 해요.', 'Keep yellow center up and the sideways-white edge at top-front. Keep the same front for F → U′ → R.'), "F U' R", c('흰 조각을 가운데 층에 꺼낸 뒤 빈 윗자리를 오른쪽으로 옮겨 올렸어요. 기존 꽃잎은 유지돼요. 실물도 네 꽃잎을 확인해요.', 'You lowered the edge, moved the empty top spot to the right, and lifted white into it. Existing petals stay on top. Check for all four petals on your cube.'), daisy),
    ],
  },
  {
    slug: 'white-cross', title: c('흰 십자 만들기', 'Turn the daisy into a white cross'), shortTitle: c('흰 십자', 'White cross'),
    goal: c('아랫면에 흰 십자를 만들고 옆 색도 맞춰요.', 'Match the white cross and its side colors.'),
    intro: c('흰색이 있는 두 색 조각 네 개를 찾아요. 흰색은 아래로, 나머지 색은 같은 색 가운데 조각 옆으로 보내요.', 'Look at a petal’s other color. Match it to its side center, then turn that face halfway to send white down.'),
    hold, check: c('아래 흰 모서리 네 개가 십자인가요? 네 옆면에서도 모서리 색과 가운데 색이 이어지나요?', 'Do the four bottom white edges make a cross? Does each of their side colors also match its center?'),
    tips: [c('흰색만 십자가 되면 아직 끝이 아니에요. 옆 색도 확인해요.', 'A white cross alone is not enough. Check the side colors too.'), c('한 꽃잎을 내려보내고 다음 꽃잎을 U로 맞춰요.', 'Send down one petal, then align the next with U turns.')],
    help: c('흰 조각을 위로 모았다면 하나씩 내려요. 윗면을 돌려 흰 조각의 옆 색을 같은 색 가운데에 맞춰요. 그 면이 나를 보게 큐브를 잡고 반 바퀴 돌려요. 남은 조각도 같은 방법으로 내려요. 아래에 있지만 옆 색이 틀린 조각은 해당 면을 반 바퀴 돌려 위로 꺼낸 뒤 다시 맞춰요.', 'Keep yellow up and white down. Use U turns to match a petal’s side color to its center. Regrip so that face is F and do F2. Repeat separately for each petal. If a bottom white edge has the wrong side color, turn its face halfway to lift it back up, align its side color, and send it down again. Check both colors of every edge.'),
    cases: [
      example('aligned', c('옆 색이 맞았어요', 'The side color matches'), c('위·앞 꽃잎의 옆 색과 앞면 가운데 색이 같아요.', 'The front-top white petal’s side color matches the front center.'), demoHold, 'F2', c('이 모서리는 아래 제자리에 왔어요. 실물의 남은 꽃잎도 하나씩 맞춰 내리세요.', 'This edge is home at the bottom. Align and send down the remaining petals one by one.')),
      example('align-first', c('윗면만 돌려 옆 색을 맞춰요', 'Turn only the top to match the side color'), c('위·오른쪽 두 색 조각의 흰색은 위를 보고, 옆 색은 앞면 가운데와 같아요. 예시에서는 흰색·초록 조각이에요.', 'The top-right edge has white facing up. Its other color matches the front center: white and green in this example.'), c('노란 가운데는 위, 초록 가운데는 앞이에요. 큐브 전체는 그대로 잡고 윗면만 위에서 볼 때 시계 방향으로 한 칸(U) 돌려요. 조각이 위·오른쪽에서 위·앞으로 와요.', 'Keep yellow up and green front. Hold the whole cube still and turn only the top clockwise as seen from above (U). The edge moves from top-right to top-front.'), 'U F2', c('초록 옆 색과 앞 가운데가 이어진 뒤, 앞면만 반 바퀴(F2) 돌려 아래로 보냈어요. 남은 흰 모서리도 옆 색을 맞추고 내려요.', 'After green lines up with the front center, turn only the front halfway (F2) to send white down. Align and lower each remaining white edge.')),
    ],
  },
  {
    slug: 'white-corners', title: c('흰 꼭짓점으로 1층 완성하기', 'Fill the first layer with white corners'), shortTitle: c('첫 층', 'First layer'),
    goal: c('흰 면과 옆면의 맨 아래 줄을 맞춰요.', 'Put four white corners into homes matching all three colors.'),
    intro: c('흰색이 있는 세 색 조각을 찾아요. 나머지 두 색과 같은 가운데 조각 사이가 들어갈 자리예요.', 'Find a three-color corner with white. Put it at top-front-right, above the home between its other two centers. Finish each four-move group.'),
    hold, check: c('아래가 모두 흰색이고, 네 옆면의 맨 아래 줄도 가운데 색과 같은가요?', 'Is the bottom all white, with each side’s bottom row matching its center?'),
    tips: [c("네 동작은 R U R' U'예요. 한 묶음 뒤에만 멈춰 확인해요.", "The four moves are R U R' U'. Check only after a complete group."), c('자리를 먼저 찾아요. 흰색이 보이는 쪽만 보고 넣지 않아요.', 'Find the right home first. Do not choose a slot just from the white sticker.')],
    help: c('먼저 흰 십자가 맞는지 확인해요. 넣을 조각을 윗층에서 맞는 자리 바로 위에 놓아요. 그 자리가 앞쪽 오른쪽에 오게 큐브를 잡아요. 네 동작을 끝낸 뒤 흰색이 아래로 들어갔는지 확인해요. 아직이면 같은 네 동작을 반복해요. 반복하는 사이에 윗면만 따로 돌리지 않아요.', 'Start with a matched white cross. Use U to put the target corner above its home; regrip so the home is bottom-front-right. Repeat R U R′ U′ without extra U turns between groups. A correctly prepared top corner inserts after 1, 3, or 5 groups depending on its white sticker. Eject an incorrect bottom corner with one group at front-right, then align it above its correct home and start again. Other solved bottom corners stay in place.'),
    cases: [
      example('white-right', c('흰색이 오른쪽을 봐요', 'White faces right'), c('흰 꼭짓점이 맞는 자리 바로 위·앞·오른쪽에 있고 흰색은 오른쪽을 봐요.', 'The white corner is at top-front-right directly above its home, with white facing right.'), demoHold, T, c('한 묶음으로 이 꼭짓점이 들어갔어요. 나머지 꼭짓점도 자리를 찾고 같은 방법으로 해요.', 'One group put this corner home. Find the homes of the remaining corners and repeat.')),
      example('white-up', c('흰색이 위를 봐요', 'White faces up'), c('맞는 자리 바로 위·앞·오른쪽 꼭짓점의 흰색이 위를 봐요.', 'The top-front-right corner is directly above its home, with white facing up.'), demoHold, repeat(T, 3), c('세 묶음 뒤 자리에 들어갔어요. 실물도 한 묶음씩 끝내고 아래 흰색과 옆 두 색을 확인해요.', 'Three complete groups put it home. On your cube, finish each group and check white below and both side colors.')),
      example('white-front', c('흰색이 앞을 봐요', 'White faces front'), c('맞는 자리 바로 위·앞·오른쪽 꼭짓점의 흰색이 앞을 봐요.', 'The top-front-right corner is directly above its home, with white facing front.'), demoHold, repeat(T, 5), c('다섯 묶음 뒤 자리에 들어갔어요. 중간에 윗층을 따로 돌리지 않아요.', 'Five complete groups put it home. Do not add separate top turns between groups.')),
      example('eject-corner', c('아래에 잘못 들어갔어요', 'A corner is trapped below'), c('아래·앞·오른쪽 꼭짓점의 색이나 방향이 틀렸어요.', 'The bottom-front-right corner has the wrong position or orientation.'), demoHold, T, c('잘못 들어간 흰 꼭짓점이 위로 나왔어요. 그 조각의 두 옆 색으로 맞는 자리를 찾고, U로 그 자리 위에 놓아요.', 'The trapped white corner came up. Find its correct home from both side colors, then use U to put it above that home.'), repeat(T, 3)),
    ],
  },
  {
    slug: 'middle-layer', title: c('가운데 조각으로 2층 맞추기', 'Send edges without yellow to the middle'), shortTitle: c('가운데 층', 'Middle layer'),
    goal: c('옆면의 아래 두 줄을 맞춰요.', 'Solve the four middle-layer edges.'),
    intro: c('윗층에서 노란색이 없는 두 색 조각을 찾아요. 옆을 보는 색을 같은 색 가운데에 맞춘 뒤, 위를 보는 색이 어느 쪽으로 가야 하는지 확인해요.', 'Find a top edge without yellow. Match its side color to the front center. Does its upward color belong on the right or left?'),
    hold, check: c('아래 흰 면과 네 옆면의 아래 두 줄이 모두 맞나요?', 'Are the white bottom and the bottom two rows of every side solved?'),
    tips: [c('노랑이 있는 모서리는 지금 넣지 않아요.', 'Leave edges with yellow for later.'), c('오른쪽·왼쪽을 고른 뒤 여덟 동작 끝까지 같은 앞면을 지켜요.', 'After choosing right or left, keep the same front through all eight moves.')],
    help: c('흰 면과 옆면의 맨 아래 줄이 맞은 상태에서 시작해요. 윗조각의 옆 색을 앞 가운데에 맞춰요. 위 색이 오른쪽 가운데와 같으면 오른쪽 사례, 왼쪽과 같으면 왼쪽 사례예요. 가운데에 잘못 낀 조각은 꺼내는 사례부터 보고, 위로 나온 뒤 다시 맞춰 넣어요.', 'Finish the first layer first. Align a non-yellow top edge’s side sticker to its center with U, and face that side. Use the right insertion if the top sticker matches the right center, or the left insertion if it matches the left center. For a wrong or flipped middle edge, put its slot at front-right and insert a yellow top edge with the right algorithm to eject it. Realign and insert the ejected piece correctly. Check all four middle edges on the real cube.'),
    cases: [
      example('insert-right', c('오른쪽 자리로', 'Into the right home'), c('위·앞 모서리에는 노랑이 없고, 앞 색은 앞 가운데와, 위 색은 오른쪽 가운데와 같아요.', 'The top-front edge has no yellow. Its front color matches the front center and its top color matches the right center.'), demoHold, rightInsert, c('앞·오른쪽 가운데 모서리가 맞았어요. 남은 노랑 없는 모서리를 찾아 다시 정렬해요.', 'The front-right middle edge is home. Find and realign another edge without yellow.')),
      example('insert-left', c('왼쪽 자리로', 'Into the left home'), c('위·앞 모서리에는 노랑이 없고, 앞 색은 앞 가운데와, 위 색은 왼쪽 가운데와 같아요.', 'The top-front edge has no yellow. Its front color matches the front center and its top color matches the left center.'), demoHold, leftInsert, c('앞·왼쪽 가운데 모서리가 맞았어요. 네 모서리가 다 맞을 때까지 골라서 해요.', 'The front-left middle edge is home. Choose and insert edges until all four are solved.')),
      example('eject-edge', c('잘못 낀 모서리를 꺼내요', 'Take out a trapped edge'), c('첫 층은 맞지만 앞·오른쪽 가운데 모서리가 틀렸어요. 윗층에 넣을 노랑 없는 모서리가 없어요.', 'The first layer is solved, but the front-right middle edge is wrong and there is no non-yellow top edge to insert.'), demoHold, rightInsert, c('잘못 낀 모서리가 위로 나왔어요. 위로 나온 노랑 없는 모서리를 찾아 옆 색을 맞춘 뒤 오른쪽·왼쪽 사례를 다시 골라요.', 'The trapped edge is now on top. Find that non-yellow edge, align its side color, and choose the right or left insertion.'), rightInsert + ' U2 ' + repeat(rightInsert, 2)),
    ],
  },
  {
    slug: 'yellow-cross', title: c('윗면에 노란 십자 만들기', 'Make a yellow cross on top'), shortTitle: c('노란 십자', 'Yellow cross'),
    goal: c('노란색 두 색 조각 네 개를 위로 돌려요.', 'Make all four yellow edges face up.'),
    intro: c('이제 3층이에요. 윗면의 가운데와 두 색 조각만 봐요. 노란 모양이 점, ㄱ, 가로선 중 어디에 가까운지 골라요.', 'Look only at the two-color edges on top. Ignore corners. Choose your dot, L, or line.'),
    hold, check: c('노란 가운데와 네 노란 모서리가 위에서 십자인가요? 옆 색은 아직 달라도 돼요.', 'Do the yellow center and four yellow edges make a top cross? Side colors may still differ.'),
    tips: [c('선은 왼쪽과 오른쪽으로, ㄱ은 뒤쪽과 왼쪽으로 놓아요.', 'Hold a line left-to-right. Hold an L with its arms at the back and left.'), c('여섯 동작 뒤 모양을 다시 보고 자세를 맞춰요. 같은 자세로 계속 반복하지 않아요.', 'After six moves, inspect the new shape and set the grip again. Do not keep repeating without checking.')],
    help: c('아래 두 층을 맞춘 상태에서 시작해요. 가로선은 왼쪽에서 오른쪽으로, ㄱ은 뒤쪽과 왼쪽으로 놓아요. 여섯 동작이 끝날 때마다 새 모양을 확인하고 다시 잡아요. 노란색이 위를 보는 두 색 조각이 한 개나 세 개뿐이면 세 색 조각을 잘못 센 것은 아닌지 확인해요.', 'With both lower layers solved, use F R U R′ U′ F′. A line needs yellow at UL and UR; an L needs yellow at UB and UL. This L becomes a horizontal line after one group; apply another. For a dot, apply one group, align the new L at back-left, then apply two groups. The dot demo’s U2 is specific to that example; on the real cube, choose U, U′, or U2 from the new pattern. If only one or three yellow edges face up, recount edges without corners and check whether a piece has been removed or twisted by hand.'),
    cases: [
      example('line', c('가로선이에요', 'A horizontal line'), c('위·왼쪽과 위·오른쪽 모서리만 노랑이 위를 봐요.', 'Only the top-left and top-right edges have yellow facing up.'), c('노란 가운데는 위, 노란 선은 왼쪽에서 오른쪽으로 놓아요.', 'Keep yellow up and the yellow line running left-to-right.'), A, c('노란 십자가 생겼나요? 네 모서리가 노랑이면 옆 색 맞추기로 가요.', 'Is there a yellow cross? With all four yellow edges up, move on to matching their side colors.')),
      example('elbow', c('뒤와 왼쪽에 ㄱ', 'An L at back-left'), c('위·뒤와 위·왼쪽 모서리만 노랑이 위를 봐요.', 'Only the top-back and top-left edges have yellow facing up.'), c('위에서 봤을 때 노란 두 팔을 뒤쪽과 왼쪽에 놓아요.', 'Viewed from above, place the yellow arms at the back and left.'), repeat(A, 2), c('두 묶음 뒤 십자가 됐어요. 한 묶음 뒤 가로선이 되는지도 보세요.', 'Two groups made the cross. Notice the horizontal line after the first group.')),
      example('dot', c('가운데 점만 있어요', 'Only a center dot'), c('네 윗모서리에는 노랑이 위를 보지 않아요. 꼭짓점은 무시해요.', 'None of the four top edges has yellow facing up. Ignore corners.'), demoHold, A + ' U2 ' + repeat(A, 2), c('이 예시는 한 묶음 뒤 U2로 ㄱ을 뒤·왼쪽에 놓고 두 묶음 더 했어요. 실물은 매 묶음 뒤 새 모양을 보고 정렬해요.', 'This example uses U2 after the first group to put the L at back-left, then two more groups. Recheck and align the real cube after each group.')),
    ],
  },
  {
    slug: 'yellow-edges', title: c('노란 십자의 옆 색 맞추기', 'Match the yellow cross side colors'), shortTitle: c('노란 모서리 자리', 'Yellow edge homes'),
    goal: c('노란 십자를 유지하며 옆면 색을 맞춰요.', 'Match all four yellow edge side colors to their centers.'),
    intro: c('윗면만 돌려 옆 색이 가운데와 두 개 또는 네 개 맞는 위치를 찾아요. 네 개가 맞으면 다음 단계로 가요.', 'Use U turns to find two or four side colors matching their centers. Four means this step is done. With two, check if they are adjacent or opposite.'),
    hold, check: c('노란 십자는 그대로이고, 네 옆면의 맨 위 모서리 색이 가운데와 같나요?', 'Is the yellow cross intact, with every top edge’s side color matching its center?'),
    tips: [c('이웃한 두 개가 맞으면 큐브 전체를 잡아 돌려, 맞은 모서리를 뒤와 오른쪽에 놓아요.', 'For two adjacent matches, regrip the whole cube so the matched edges are at back and right.'), c('꼭짓점 색은 아직 달라도 돼요. 가운데 바로 위의 모서리만 봐요.', 'Corners may still differ. Look only at the edge directly above each center.')],
    help: c('맞은 두 조각이 이웃하면 그 둘이 뒤와 오른쪽에 오게 큐브 전체를 잡아 돌려요. 마주 보면 맞은 둘을 앞과 뒤에 놓아요. 선택한 사례를 마지막 동작까지 보고 네 옆 색을 다시 확인해요. 꼭짓점 색은 아직 달라도 돼요.', 'This lesson uses R U R′ U R U2 R′ U, including the final U. It swaps the top-front and top-left edges while preserving the yellow cross. For two adjacent matches, hold them at back-right; one group then matches all four sides. For opposite matches, put them at front-back and finish the longer case, or do one group, use U to find two matches again, and regrip for the adjacent case. If two edges remain wrong, check that yellow is up and the final U was completed.'),
    cases: [
      example('adjacent', c('뒤와 오른쪽이 맞아요', 'Back and right match'), c('노란 십자에서 뒤와 오른쪽 모서리의 옆 색만 가운데와 맞아요.', 'The yellow cross has matching side colors only at the back and right edges.'), c('맞은 둘을 뒤·오른쪽에 두고, 틀린 둘을 앞·왼쪽에 둬요.', 'Hold the matched pair at back-right and the unmatched pair at front-left.'), E, c('네 옆 색이 다 맞았는지 봐요. 꼭짓점이 달라도 다음 단계로 갈 수 있어요.', 'Check all four side colors. You can continue even if corners still differ.')),
      example('opposite', c('앞과 뒤가 맞아요', 'Front and back match'), c('노란 십자에서 앞과 뒤 모서리의 옆 색만 가운데와 맞아요.', 'The yellow cross has matching side colors only at the front and back edges.'), c('맞은 둘을 앞·뒤에 놓아요. 이 긴 예시는 끝까지 앞면을 바꾸지 않아요.', 'Hold the matched pair at front-back. Keep the same front through this longer example.'), E + ' U2 ' + E + ' U', c('두 묶음 사이 U2, 마지막 U까지 했어요. 이제 네 옆 색을 확인해요.', 'You used U2 between the groups and U at the end. Check all four side colors now.')),
    ],
  },
  {
    slug: 'yellow-corners', title: c('노란 꼭짓점의 자리 맞추기', 'Find homes for the yellow corners'), shortTitle: c('노란 꼭짓점 자리', 'Yellow corner homes'),
    goal: c('세 색 조각 네 개를 맞는 자리에 놓아요.', 'Put corners in homes matching all three colors; their twist can wait.'),
    intro: c('꼭짓점의 세 색을 보고 그 색의 가운데 조각 사이에 있는지 확인해요. 지금은 노란색이 옆을 봐도 괜찮아요.', 'Yellow may face sideways. A corner is in its home when its three colors match the three surrounding centers.'),
    hold, check: c('윗꼭짓점 네 개가 모두 세 색이 맞는 자리에 있나요? 노랑이 위를 보지 않아도 돼요.', 'Are all four top corners in homes matching their three colors? Yellow does not need to face up yet.'),
    tips: [c('맞는 꼭짓점 하나를 위·앞·오른쪽에 둬요. 윗층만 돌리지 말고 큐브 전체를 잡아 돌려요.', 'Regrip the whole cube to put one correct corner at top-front-right. Do not turn just the top for this grip change.'), c('맞는 자리가 하나도 없으면 한 묶음 뒤 다시 찾아요.', 'If none are in their homes, do one group and look again.')],
    help: c('노란 십자의 옆 색 네 개가 맞아야 해요. 제자리에 있는 꼭짓점 하나를 앞쪽 오른쪽 위에 놓아요. 큐브 전체를 돌려 잡고, 윗면만 따로 돌리지 않아요. 여덟 동작을 한 뒤 네 조각의 자리를 다시 확인해요. 맞는 조각이 하나도 없으면 한 묶음을 먼저 보고 다시 찾아요.', 'First match all four yellow edge side colors. U R U′ L′ U R′ U′ L keeps the top-front-right corner’s position and cycles the other three. Hold a correct corner there, do one group, and recheck homes. If only one is correct, do one more in the same grip. If none are correct, do one group with any front, find a correct corner, and regrip the whole cube to put it at front-right. Stop when all four are home. If exactly two seem correct, recheck all three colors and the previous edge step.'),
    cases: [
      example('one-correct', c('앞·오른쪽 하나가 제자리예요', 'Front-right is in its home'), c('위·앞·오른쪽 꼭짓점만 세 색이 맞는 자리에 있어요. 노란 모서리는 모두 맞아요.', 'Only the top-front-right corner is in its three-color home. All yellow edges are matched.'), demoHold, C, c('네 자리를 다시 확인해요. 하나만 맞으면 같은 자세로 한 묶음 더 해요. 이 예시는 한 묶음으로 맞아요.', 'Recheck all four homes. If only one is correct, repeat once in the same grip. This example needs one group.')),
      example('one-correct-twice', c('두 묶음이 필요한 경우', 'When two groups are needed'), c('앞·오른쪽만 제자리예요. 다른 세 꼭짓점이 첫 번째 예시와 반대 순서로 있어요.', 'Only front-right is home. The other three corners are cycled in the opposite order to the first example.'), demoHold, repeat(C, 2), c('이 예시는 두 묶음으로 네 자리가 맞아요. 실제로 네 자리가 맞았다면 더 반복하지 않아요.', 'This example needs two groups to match all homes. Stop as soon as all four real corners are home.')),
      example('none-correct', c('제자리인 꼭짓점이 없어요', 'No corner is in its home'), c('노란 모서리는 맞지만 꼭짓점 네 개 모두 세 색의 자리가 달라요.', 'Yellow edges are matched, but none of the four corners is in its three-color home.'), demoHold, C, c('이제 제자리인 꼭짓점이 하나 생겼어요. 큐브 전체를 잡아 돌려 그 조각을 위·앞·오른쪽에 두고, 하나 맞은 사례로 가요.', 'Now one corner is in its home. Regrip the whole cube to put it at top-front-right, then use the one-correct-corner case.'), 'U2 ' + C + ' U2'),
    ],
  },
  {
    slug: 'finish', title: c('노란 꼭짓점을 돌려 완성하기', 'Twist the corners and finish'), shortTitle: c('방향과 완성', 'Twist and finish'),
    goal: c('노란색을 위로 돌리고 여섯 면을 완성해요.', 'Make the yellow on each correctly placed corner face up.'),
    intro: c('마지막은 꼭짓점의 방향이에요. 노란색이 옆을 보는 조각을 앞쪽 오른쪽 위에 놓고 시작해요.', 'Read the whole step before starting. Put a sideways-yellow corner at top-front-right. Follow the sequence even while the lower layers look mixed.'),
    hold: c('노랑 위·흰색 아래를 끝까지 지켜요. 시작 후 큐브 전체나 앞면을 바꾸지 않아요. D는 아랫면만 돌리는 기호예요.', 'Keep yellow up and white down throughout. After starting, do not rotate the whole cube or change the front. D turns only the bottom face.'),
    check: c('마지막에 U로 윗층을 맞추었나요? 여섯 면이 모두 가운데 색과 같으면 완성이에요.', 'Did you align the top with U at the end? You are done when all six faces match their centers.'),
    tips: [c("R' D' R D를 두 번 또는 네 번 해요. 마지막 D까지 마친 뒤 노랑이 위를 보는지 봐요.", "Do R' D' R D two or four times. Finish the last D before checking whether yellow faces up."), c('이 꼭짓점이 맞으면 U로 다음 틀린 꼭짓점만 같은 위·앞·오른쪽 자리로 보내요.', 'When this corner is oriented, use only U turns to bring the next twisted corner to the same top-front-right spot.'), c('중간의 아래층을 따로 고치지 않아요. 모든 꼭짓점을 끝내고 윗층을 정렬하면 돌아와요.', 'Do not repair the lower layers midway. They return after all corners are oriented and the top is aligned.')],
    help: c('예시는 두 꼭짓점과 마지막 정렬까지 이어져요. 실물은 남은 틀린 꼭짓점마다 윗면만 돌려 같은 자리에 가져와 반복해요. 아래층은 마지막까지 따로 고치지 않아요. 끝나도 아래층이 다르면 빠진 D, 바뀐 앞면, 이전 단계의 완료 조건을 확인해요.', 'Each example continues through two corners and the final alignment. On your cube, bring every remaining twisted corner to the same spot with only top turns and repeat. Leave the lower layers alone until the end. If they remain wrong, check for a missed D, a changed front, or an incomplete earlier step.'),
    cases: [
      example('complete-walkthrough', c('노랑이 오른쪽을 봐요', 'Yellow faces right'), c('오른쪽 위의 두 꼭짓점이 옆을 봐요. 앞쪽 꼭짓점의 노랑은 오른쪽을 봐요.', 'The two top-right corners are twisted. Yellow on the front-right corner faces right.'), finishHold, finishMoves(2), finishAfter),
      example('two-corners-front', c('노란색이 앞쪽을 봐요', 'Yellow faces front'), c('위·앞·오른쪽 꼭짓점의 노랑이 앞을 봐요. 이 예시에는 돌릴 꼭짓점이 두 개 있어요.', 'Yellow on the top-front-right corner faces front. This example has two twisted corners.'), finishHold, finishMoves(4), finishAfter),
    ],
  },
];



// 앞 단계의 완성 조건을 지키면서 다음 층은 섞어 둔 예시를 사용한다.
// 제자리에서 방향만 다른 두 꼭짓점. 이전 층과 노란 모서리는 보존한다.
const cornerTwists = repeat(Q, 2) + ' U ' + repeat(Q, 4) + " U'";
const stageSetups: Record<string, string> = {
  ready: "R U2 F' L D B2 R'",
  'white-cross': T + ' ' + rightInsert + ' ' + A,
  'white-corners': rightInsert + ' ' + A,
  'middle-layer': A + ' ' + E,
  'yellow-cross': E + ' ' + C + ' ' + cornerTwists,
  'yellow-edges': C + ' ' + cornerTwists,
  'yellow-corners': cornerTwists,
};
for (const lesson of lessonLibrary) {
  for (const item of lesson.cases) {
    if (!item.targetSetup && stageSetups[lesson.slug]) item.targetSetup = stageSetups[lesson.slug];
    if (lesson.slug === 'yellow-corners' && item.id === 'none-correct') item.targetSetup += ' ' + cornerTwists;
    if (lesson.slug === 'white-corners' && item.id !== 'eject-corner') {
      item.checkpoints = Array.from({ length: item.steps.length / 4 }, (_, i) => ({
        at: (i + 1) * 4, title: c(`${i + 1}번째 네 동작 끝`, `Group ${i + 1} complete`),
        check: i === item.steps.length / 4 - 1 ? item.after : c('흰색이 아래, 옆 두 색이 가운데와 맞는지 확인해요. 아직이면 윗면을 따로 돌리지 않고 같은 네 동작을 해요. 중간에 십자가 잠시 달라져도 이 조각을 넣는 순서를 이어가요.', 'Check white below and both side colors against their centers. If it is not inserted yet, repeat the four moves without an extra top turn. The cross can look different during the insertion; continue this corner sequence.'),
      }));
    }
  }
}

const point = (at: number, title: Copy, check: Copy): Checkpoint => ({ at, title, check });
const crossLine = point(6, c('노란 십자 확인', 'Check the yellow cross'), c('노란 모서리 네 개가 위를 보면 여기서 멈춰요. 옆 색과 꼭짓점은 다음 수업에서 맞춰요.', 'Stop when all four yellow edges face up. Side colors and corners are for the next lessons.'));
const checkpoints: Record<string, Checkpoint[]> = {
  'daisy/top-side': [
    point(1, c('먼저 가운데 층으로 꺼내요', 'First lower the edge into the middle'), c('F 뒤 흰 모서리가 앞·오른쪽 가운데 층에 있고, 흰색이 앞을 봐요. 위·앞은 꽃잎 없는 빈자리예요. 이제 윗면만 U′로 돌려요.', 'After F, the edge is at front-right in the middle, with white facing front. The top-front spot has no petal. Turn only the top with U′ next.')),
    point(2, c('올릴 자리를 비웠어요', 'The destination is now free'), c('빈자리가 위·오른쪽으로 왔어요. 이제 오른쪽 면만 R로 돌려 흰색을 위로 올려요. 앞면을 바꾸지 않아요.', 'The empty spot is now at top-right. Turn only the right face with R to lift white up. Keep the same front.')),
  ],
  'white-cross/align-first': [
    point(1, c('옆 색부터 확인', 'Check the side color first'), c('흰색·초록 조각이 위·앞에 왔나요? 초록 스티커 바로 아래에 초록 가운데가 있어야 해요. 맞으면 앞면만 반 바퀴 돌려요.', 'Is the white-green edge at top-front, with its green sticker directly above the green center? Then turn only the front halfway.')),
  ],
  'yellow-cross/line': [crossLine],
  'yellow-cross/elbow': [
    point(6, c('ㄱ에서 가로선으로', 'L becomes a horizontal line'), c('여섯 동작 뒤 노란 모서리가 왼쪽·오른쪽의 가로선이 됐어요. 같은 앞면을 유지하고 여섯 동작을 한 번 더 해요.', 'After six moves, the yellow edges form a left-right line. Keep the same front and repeat the six moves once.')),
    { ...crossLine, at: 12 },
  ],
  'yellow-cross/dot': [
    point(6, c('점에서 ㄱ으로', 'Dot becomes an L'), c('노란 모서리 두 개가 생겼어요. 이 예시는 앞·오른쪽의 ㄱ이에요. 실물의 새 ㄱ을 확인하고 뒤·왼쪽으로 정렬해요.', 'Two yellow edges now face up. This example has an L at front-right. Inspect your real L and align its arms at back-left.')),
    point(7, c('윗면만 돌려 ㄱ 정렬', 'Align the L with only the top'), c('이 예시는 U2로 ㄱ을 뒤·왼쪽에 놓았어요. 실물은 필요한 만큼 U, U′, U2 중 골라요. 준비되면 같은 여섯 동작을 해요.', 'This example needs U2 to put the L at back-left. Your cube may need U, U′, or U2. Once aligned, apply the same six moves.')),
    point(13, c('ㄱ에서 가로선으로', 'L becomes a horizontal line'), c('이제 왼쪽·오른쪽 가로선이에요. 앞면을 바꾸지 않고 같은 여섯 동작을 한 번 더 해요.', 'Now there is a left-right line. Keep the same front and repeat the same six moves once.')),
    { ...crossLine, at: 19 },
  ],
  'yellow-edges/opposite': [
    point(8, c('첫 묶음 뒤 다시 비교', 'Compare again after the first group'), c('여기서 아직 네 옆 색이 다 맞지 않아요. 다음은 이 예시의 정렬이에요. 실물은 윗면을 돌려 두 개가 맞는 위치를 다시 찾고, 이웃하면 뒤·오른쪽에 두는 사례로 가도 돼요.', 'The four sides are not matched yet. The next alignment is specific to this demo. On your cube, turn the top to find two matches again; if adjacent, regrip them at back-right and use that case.')),
    point(9, c('이 예시의 중간 정렬', 'Intermediate alignment in this example'), c('U2를 했어요. 앞면을 바꾸지 않고 같은 여덟 동작을 한 번 더 해요. 이 긴 예시는 마지막에 U 정렬이 한 번 더 남아요.', 'After U2, keep the same front and repeat the eight moves. This longer example still needs a final U alignment.')),
    point(17, c('마지막 윗층 정렬이 남아요', 'One final top alignment remains'), c('아래 두 층과 노란 십자는 유지됐어요. 마지막 U까지 해야 옆 색 네 개가 가운데와 맞아요.', 'The lower two layers and yellow cross are intact. Finish the last U to match all four edge side colors to their centers.')),
  ],
  'yellow-corners/one-correct-twice': [
    point(8, c('한 묶음 뒤 자리 확인', 'Check homes after one group'), c('세 색으로 네 자리를 다시 살펴봐요. 이 예시는 아직 하나만 맞아서 같은 앞면으로 한 묶음 더 해요. 실물이 네 자리 모두 맞으면 멈춰요.', 'Compare all three colors at every home. This demo still has only one correct corner, so repeat in the same grip. Stop if all four real corners are home.')),
  ],
  'finish/two-corners-front': [
    point(8, c('같은 공식 두 묶음 더', 'Two more groups'), c('노랑이 아직 옆을 봐요. 같은 공식을 두 번 더 해요. 아래층은 따로 고치지 않아요.', 'Yellow still faces sideways. Repeat the formula twice more. Leave the lower layers alone.')),
    point(16, c('첫 꼭짓점 완료', 'First corner oriented'), c('노랑이 위를 봐요. 윗면만 U로 돌려 뒤·오른쪽의 다음 꼭짓점을 앞으로 가져와요.', 'Yellow faces up. Turn only the top with U to bring the next back-right corner to front-right.')),
    point(17, c('다음 꼭짓점 돌리기', 'Twist the next corner'), c('같은 앞면을 유지하고 이 꼭짓점에도 공식을 두 번 해요.', 'Keep the same front and apply the formula twice to this corner.')),
    point(25, c('마지막 윗층 정렬', 'Final top alignment'), c('노랑이 모두 위를 봐요. 마지막 U′로 옆 색을 가운데에 맞춰요.', 'All yellow faces up. Use the final U′ to match the side colors to their centers.')),
  ],
  'finish/complete-walkthrough': [
    point(8, c('첫 꼭짓점의 노랑이 위로', 'First corner is yellow up'), c('첫 꼭짓점의 노랑이 위를 봐요. 아래층은 잠시 흐트러져 있어요. 이제 윗면만 U로 돌려 뒤·오른쪽의 다음 조각을 앞·오른쪽으로 가져와요.', 'The first corner is yellow up. The lower layers are temporarily mixed. Turn only the top with U to bring the back-right twisted corner to front-right.')),
    point(9, c('다음 꼭짓점이 같은 작업 자리로', 'Next corner reaches the working spot'), c('다음 꼭짓점이 위·앞·오른쪽에 왔어요. 초록 앞면을 유지하고 같은 네 동작을 두 번 해요.', 'The next corner is at top-front-right. Keep green front and do the same four moves twice.')),
    point(17, c('아직 옆을 보면 두 묶음 더', 'Still sideways: two more groups'), c('이 조각의 노랑은 아직 옆을 봐요. 마지막 D를 빼먹지 않고 같은 네 동작을 두 번 더 해요.', 'This corner still has yellow facing sideways. Do two more groups, including the last D.')),
    point(25, c('노랑은 위로, 옆 색 정렬은 한 번 더', 'Yellow is up; align the sides next'), c('윗면은 모두 노랑이고 아래 두 층도 돌아왔어요. 아직 옆면 맨 위 줄이 어긋나 있으니 마지막 U′로 맞춰요.', 'The top is all yellow and the lower two layers have returned. The top side rows are still offset; align them with the final U′.')),
  ],
};
for (const lesson of lessonLibrary) for (const item of lesson.cases) {
  const custom = checkpoints[`${lesson.slug}/${item.id}`];
  if (custom) item.checkpoints = custom.at(-1)!.at === item.steps.length ? custom : [...custom, ...item.checkpoints];
}

// 보조 설명도 이전 주소에서 열 수 있게 전체 경로 목록은 별도로 유지한다.
export const allLessons = lessonLibrary;
export const lessons = lessonLibrary.filter(lesson => !['ready', 'daisy'].includes(lesson.slug));
