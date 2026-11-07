import type { Copy } from './lessons';

const c = (ko: string, en: string): Copy => ({ ko, en });
type Guide = { before: Copy; steps: Copy[] };

// 실물에서 조각을 고르고 반복·종료하는 순서는 특정 시연의 색 배치와 구분한다.
export const guidance: Record<string, Guide> = {
  ready: {
    before: c('3×3 큐브를 준비해요. 가운데 조각은 한 색, 모서리는 두 색, 꼭짓점은 세 색이에요.', 'Use a 3×3 cube. Centers have one color, edges two, and corners three.'),
    steps: [
      c('노란 가운데를 위, 흰 가운데를 아래로 잡아요. 내 쪽 면이 앞면이에요.', 'Hold yellow center up and white center down. The face toward you is the front.'),
      c('F는 앞면만, U는 윗면만 돌려요. 시계 방향은 돌릴 면을 정면으로 볼 때를 기준으로 해요.', 'F turns only the front; U turns only the top. Clockwise is viewed straight at the face being turned.'),
      c('화면의 이전·초기화는 시연만 바꿔요. 실물 동작을 취소하려면 했던 순서의 반대 순서로, 방향도 반대로 돌려요.', 'Back and reset affect only the demo. To undo physical moves, reverse both their order and direction.'),
    ],
  },
  daisy: {
    before: c('흰색이 있는 두 색 조각 네 개만 찾아요. 흰 꼭짓점은 나중에 맞춰요.', 'Find the four two-color edges with white. Leave white corners for later.'),
    steps: [
      c('노란 가운데를 위에 두고 흰 모서리 하나를 골라요. 흰색이 보는 방향으로 사례를 선택해요.', 'Keep yellow center up. Choose one white edge, then select a case by the direction its white sticker faces.'),
      c('그 조각이 올라갈 윗자리에 꽃잎이 있으면 윗면만 돌려 비워요. 윗층에서 흰색이 옆을 보면 그 사례처럼 먼저 가운데 층으로 꺼내고, 그다음 윗면으로 빈자리를 옮겨요. 꽃잎 세 개를 모은 뒤에도 같은 순서예요.', 'If a petal occupies its destination, turn only the top to free the spot. For sideways white in the top layer, follow that case: lower it into the middle first, then move the empty top spot. This also works after gathering three petals.'),
      c('한 조각을 올린 뒤 새 흰 모서리를 골라 반복해요. 옆을 보는 조각을 꺼냈다면 새 위치에 맞는 사례를 다시 골라요.', 'After lifting one edge, choose the next and repeat. If you first ejected an edge, select a new case for its new position.'),
      c('노란 가운데 둘레에 흰 꽃잎 네 개가 모이면 흰 십자 수업으로 돌아가요. 옆 색은 아직 달라도 돼요.', 'Once four white petals surround yellow, return to the white cross lesson. Side colors can still differ.'),
    ],
  },
  'white-cross': {
    before: c('노란 가운데는 위, 흰 가운데는 아래예요. 흰 모서리가 흩어져 있다면 위의 흰 조각 모으기 설명부터 봐요.', 'Keep yellow center up and white center down. If white edges are scattered, use the daisy help above first.'),
    steps: [
      c('흰 꽃잎 하나의 옆 색을 읽어요. 꼭짓점이 아닌 두 색 조각을 골라요.', 'Read one white petal’s side color. Choose a two-color edge, not a corner.'),
      c('큐브 전체를 그대로 잡고 윗면만 돌려, 옆 색이 같은 색 가운데 바로 위에 오게 해요.', 'Hold the whole cube still. Turn only the top until that side color sits directly above its matching center.'),
      c('맞춘 옆면이 앞이 되게 큐브 전체를 잡아 돌린 뒤, 앞면만 반 바퀴(F2) 돌려 흰색을 아래로 보내요.', 'Regrip the whole cube so that matched side is front. Turn only the front halfway (F2) to send white down.'),
      c('다른 꽃잎을 골라 반복해요. 아래 흰 모서리 네 개와 각 옆 색까지 맞으면 다음 단계예요. 아래 조각의 옆 색이 틀리면 그 면을 반 바퀴 돌려 다시 올려요.', 'Choose another petal and repeat. Continue only when all four bottom white edges and their side colors match. If a bottom edge has the wrong side color, lift it with a half turn of that face and realign it.'),
    ],
  },
  'white-corners': {
    before: c('흰 십자와 네 옆 색이 먼저 맞아 있어야 해요.', 'First finish the white cross and its four side colors.'),
    steps: [
      c('흰 꼭짓점 하나의 세 색을 읽고, 그 색의 가운데 세 개 사이에서 들어갈 자리를 찾아요.', 'Read all three colors of one white corner. Its home is between the three matching centers.'),
      c('그 자리를 앞·오른쪽 아래에 두고, U로 목표 조각을 바로 위에 놓아요. 아래에 잘못 끼었다면 꺼내기 사례부터 해요.', 'Put the home at bottom-front-right. Use U to bring the corner directly above it. If trapped below, use the ejection case first.'),
      c('R U R′ U′를 한 묶음씩 끝내요. 흰색이 아래, 옆 두 색이 가운데와 맞을 때까지 반복해요. 예시는 1·3·5묶음이고, 사이에 U를 따로 넣지 않아요.', 'Finish R U R′ U′ one full group at a time until white faces down and both side colors match. The examples need 1, 3, or 5 groups; add no separate U turns between them.'),
      c('들어간 조각을 확인한 뒤 다른 흰 꼭짓점을 골라요. 아래 흰 면 전체와 네 옆면의 맨 아래 줄이 맞으면 끝이에요.', 'Check the inserted corner, then choose another white corner. Finish when the white bottom and all four side bottom rows match.'),
    ],
  },
  'middle-layer': {
    before: c('아래 흰 면과 네 옆면의 맨 아래 줄이 맞아 있어야 해요.', 'The white bottom and the bottom row of every side must be solved.'),
    steps: [
      c('윗층에서 노랑이 없는 두 색 조각을 골라요. U로 옆 색을 같은 색 가운데 위에 놓고 그 면을 앞으로 잡아요.', 'Choose a top edge without yellow. Use U to match its side color to a center, then hold that face at the front.'),
      c('위를 보는 색이 오른쪽 가운데와 같으면 오른쪽 넣기, 왼쪽 가운데와 같으면 왼쪽 넣기를 골라요.', 'If its upward color matches the right center, choose right insertion; if it matches the left center, choose left insertion.'),
      c('여덟 동작을 마친 뒤 그 조각의 두 색과 1층을 확인해요. 다음 조각은 옆 색을 다시 정렬한 뒤 넣어요.', 'Complete all eight moves, then check both colors of that edge and the first layer. Realign each next edge before inserting it.'),
      c('윗층에 노랑 없는 조각이 없는데 2층이 틀리면 꺼내기 사례로 잘못 낀 조각을 올려 다시 넣어요. 네 옆면의 아래 두 줄이 모두 맞으면 끝이에요.', 'If no top edge is yellow-free but the middle is wrong, eject a trapped edge and reinsert it. Finish when the lower two rows of all four sides match.'),
    ],
  },
  'yellow-cross': {
    before: c('흰 면과 네 옆면의 아래 두 줄이 맞아 있어야 해요. 위의 두 색 모서리 네 개만 보고 꼭짓점은 세지 않아요.', 'Solve the white bottom and the lower two rows of all sides first. Count only the four top edges, ignoring corners.'),
    steps: [
      c('노랑이 위를 보는 모서리 수와 위치를 봐요. 0개는 점, 이웃한 2개는 ㄱ, 마주 보는 2개는 선, 4개는 십자예요. 이미 십자면 다음 단계로 가요.', 'Count yellow-up edges: zero is a dot, two adjacent an L, two opposite a line, four a cross. If already a cross, continue to the next lesson.'),
      c('점은 어느 앞면에서나 시작해요. ㄱ은 뒤·왼쪽, 선은 왼쪽·오른쪽으로 놓아요. 윗면만 돌려 모양을 정렬해도 돼요.', 'Start a dot with any front. Align an L at back-left, or a line left-right. You may turn only the top to align the pattern.'),
      c('F R U R′ U′ F′ 여섯 동작을 한 번 끝내고 멈춰요. 새 모양을 확인하고 다시 정렬한 뒤 같은 묶음을 반복해요. 점은 최대 3묶음, ㄱ은 2묶음, 선은 1묶음이에요.', 'Finish F R U R′ U′ F′ once and stop. Inspect and align the new pattern before repeating. A dot takes up to three groups, an L two, and a line one.'),
      c('네 노란 모서리가 위를 보면 멈춰요. 아직 옆 색은 달라도 돼요. 1개나 3개로 보이면 꼭짓점을 빼고 다시 세고, 아래 두 층도 확인해요.', 'Stop when all four yellow edges face up; their side colors can differ. If you count one or three, recount without corners and check the lower layers.'),
    ],
  },
  'yellow-edges': {
    before: c('아래 두 층과 윗면 노란 십자가 먼저 맞아 있어야 해요. 각 옆면 가운데 바로 위의 두 색 조각만 비교해요.', 'First solve the lower two layers and the yellow cross. Compare only the edge directly above each side center.'),
    steps: [
      c('윗면만 U로 한 칸씩 돌리고 매번 네 옆 색을 세요. 처음 위치를 포함한 네 위치 중 두 개 또는 네 개가 맞는 위치를 찾아요. 네 개면 다음 단계예요.', 'Turn only the top one U at a time, counting matches after each turn. Among its four positions, find two or four matches. Four means this step is done.'),
      c('두 개가 이웃하면 큐브 전체를 잡아 돌려 맞은 둘을 뒤·오른쪽에 놓아요. R U R′ U R U2 R′ U를 마지막 U까지 하면 네 옆 색이 맞아요.', 'If two matches are adjacent, regrip them at back-right. Complete R U R′ U R U2 R′ U, including the final U, to match all four.'),
      c('두 개가 마주 보면 앞·뒤에 두고 같은 여덟 동작을 한 번 해요. 다시 U로 두 개가 맞는 위치를 찾고, 이웃한 둘을 뒤·오른쪽에 놓아 한 번 더 해요.', 'If the matches are opposite, hold them at front-back and do the eight moves once. Find two matches again with U, regrip the adjacent pair at back-right, and repeat once.'),
      c('마주 보는 긴 시연은 같은 앞면을 유지하도록 중간 U2와 마지막 U를 포함해요. 실물은 위의 재확인 방법을 따라도 돼요. 네 옆 색과 아래 두 층을 확인하고 끝내요.', 'The longer opposite demo keeps one front using an intermediate U2 and final U. On your cube, you may use the recheck-and-regrip method above. Finish by checking all four edge sides and the lower layers.'),
    ],
  },
  'yellow-corners': {
    before: c('아래 두 층과 노란 모서리의 옆 색 네 개가 맞아 있어야 해요. 꼭짓점은 방향 대신 세 색의 자리를 확인해요.', 'First solve the lower two layers and all four yellow edge side colors. Check each corner’s three-color home, regardless of its twist.'),
    steps: [
      c('꼭짓점의 세 색이 주변 가운데 세 색과 같으면 제자리예요. 노랑이 옆을 봐도 제자리일 수 있어요. 네 개가 제자리면 마지막 수업으로 가요.', 'A corner is home when its three colors match the surrounding centers, even if yellow faces sideways. If all four are home, go to the final lesson.'),
      c('제자리 하나를 큐브 전체를 잡아 돌려 위·앞·오른쪽에 놓아요. U만 돌리면 맞춘 모서리의 옆 색이 어긋나니 잡는 방향을 바꿔요.', 'Regrip the whole cube to put one correct corner at top-front-right. Use a whole-cube regrip; a separate U would misalign the matched edge sides.'),
      c('U R U′ L′ U R′ U′ L 여덟 동작 뒤 네 자리를 다시 봐요. 하나만 맞으면 같은 앞면으로 한 번 더, 네 개면 멈춰요.', 'After U R U′ L′ U R′ U′ L, check all four homes. If only one is correct, repeat in the same grip; if four, stop.'),
      c('제자리가 하나도 없으면 아무 앞면으로 한 묶음 해요. 생긴 제자리 조각을 찾아 위·앞·오른쪽에 놓고 다시 시작해요. 두 개만 맞는 듯하면 세 색과 이전 모서리 단계를 다시 확인해요.', 'If none is home, do one group with any front. Find the new correct corner, regrip it at top-front-right, and start again. If exactly two seem correct, recheck all three colors and the previous edge step.'),
    ],
  },
  finish: {
    before: c('아래 두 층과 노란 모서리, 꼭짓점의 자리가 맞은 상태에서 시작해요.', 'Start with the lower layers, yellow edges, and all corner homes correct.'),
    steps: [
      c('틀린 꼭짓점을 위·앞·오른쪽에 놓아요. 시작한 앞면은 끝까지 유지해요.', 'Put a twisted corner at top-front-right. Keep this front throughout.'),
      c('R′ D′ R D를 두 번, 필요하면 두 번 더 해요. 마지막 D까지 마치고 노랑을 확인해요.', 'Do R′ D′ R D twice, then twice more if needed. Finish the last D before checking yellow.'),
      c('노랑이 위를 보면 윗면만 돌려 다음 틀린 꼭짓점을 같은 자리에 가져와요. 남은 조각마다 반복해요. 아래층은 따로 고치지 않아요.', 'When yellow faces up, turn only the top to bring the next twisted corner to this spot. Repeat for every remaining corner. Leave the lower layers alone.'),
      c('윗면이 모두 노랑이면 윗층을 돌려 옆 색을 맞춰요. 아래층까지 돌아왔는지 여섯 면을 확인해요.', 'When the top is all yellow, align its side colors with a top turn. Check that the lower layers have returned and all six faces match.'),
    ],
  },
};
