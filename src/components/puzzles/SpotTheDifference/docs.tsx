import type { PuzzleDoc } from '../../../types/puzzleDoc';
import type { SpotTheDifferenceConfig } from './generator';

const docs: PuzzleDoc<SpotTheDifferenceConfig> = {
  summary: <>Two pictures of the same little world. Choose a cottage garden, a seaside, a woodland camp or a farmyard. Look closely and circle what has changed in the second picture.</>,
  ages: <>4–7. Younger children can try three differences with you beside them.</>,
  time: <>3–10 minutes</>,
  needs: <>A pencil or crayon</>,
  reading: <>None once you have explained the task.</>,
  example: { seed: 42 },
  howItWorks: <><p>The garden has a cottage, an apple tree, a cat or dog and a duck pond. At the seaside, look for a sailing boat, lighthouse, beach hut and crab. In the woodland camp, an owl watches over a tent, a hedgehog and a picnic. The farmyard has a barn, orchard tree, scarecrow, tractor and a sheep or pig.</p><p>Each new puzzle rearranges the foreground, varies object sizes and directions, and can move the landmarks to the other side. The garden may have a cat or a dog; the farmyard may have a sheep or a pig. Buildings, patterns and decorations vary too, alongside a fresh set of differences. A difference might be a missing chimney, more apples, a different-shaped window, a sleeping owl or an animal facing the other way. Each change is in a separate part of the scene. There are no differences that depend only on colour.</p><p>Circle a change in either picture. There is no need to mark both. The pictures sit beside each other on a wide puzzle and one above the other on a tall one.</p></>,
  sayAloud: ['These pictures look the same, but a few things have changed. Can you find them?', 'Look at this part of the first picture. Now find the same part in the other one. What do you notice?'],
  skills: ['Looking closely', 'Comparing pictures', 'Searching one part at a time'],
  whyItMatters: <p>Comparing two pictures gives them a reason to slow down and look at shapes, numbers and directions. Naming what changed is a chance to use words such as “round”, “more” and “missing”.</p>,
  settings: {
    scene: { label: 'Scene', description: <p>Choose Cottage garden, Seaside, Woodland camp or Farmyard to stay in one setting. Surprise me picks a setting each time you get a new puzzle. Changing the number of differences or resizing keeps that setting. Older saved puzzles keep the garden until you choose another scene.</p> },
    differences: { label: 'Differences', description: <p>Choose 3, 5 or 7 changes. Three is the starting point for ages 4–5; ages 6–7 starts with five. Adding more keeps the differences already chosen for that puzzle.</p> },
    outline: { label: 'Black and white', description: <p>Draws the scene as outlines, ready to colour in. The answers stay the same. All the differences can be found without colour.</p> },
    answers: { label: 'Mark the answers', description: <p>Draws a dashed circle round each changed area in the second picture. Use this to check together, or print a separate answer copy. Switch it off before printing the child’s puzzle.</p> },
  },
  size: <p>The pictures fill the space you give them. Wide puzzles put the pictures beside each other; taller ones stack them. Each scene spreads out or grows taller to fit, keeping its objects in proportion. Resizing keeps the same differences. The starting size is 10 squares wide and 5 high. At the smallest size, sit beside them and help with the finer details.</p>,
  easier: ['Start with three differences and large pictures.', 'Point to one part of the picture and compare it together.', 'Let them point while you circle.'],
  harder: ['Choose five or seven differences.', 'Ask them to describe each change before circling it.', 'Let them choose a way to search, such as from the sky down to the ground.'],
  mistakes: [{ sign: 'Keeps finding the same difference', meaning: <>This is common. Circle each change as you find it so there is a record.</> }, { sign: 'Cannot find the last one', meaning: <>Looking between two busy pictures takes effort. Take a break, then compare one object at a time. Point to the area rather than giving the answer straight away.</> }],
  beyondThePage: ['Put five objects on a tray. Let them look, cover the tray, then remove one. What is missing?', 'Build two little brick houses with one difference and ask them to find it.'],
};

export default docs;
