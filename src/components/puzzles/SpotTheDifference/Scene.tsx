import Garden from './Garden';
import Playground from './Playground';
import Farmyard from './Farmyard';
import Seaside from './Seaside';
import Camping from './Camping';
import type { SceneProps } from './SceneFrame';

export default function Scene(props: SceneProps) {
  if (props.scene.theme === 'playground') return <Playground {...props} />;
  if (props.scene.theme === 'farmyard') return <Farmyard {...props} />;
  if (props.scene.theme === 'seaside') return <Seaside {...props} />;
  if (props.scene.theme === 'camping') return <Camping {...props} />;
  return <Garden {...props} />;
}
