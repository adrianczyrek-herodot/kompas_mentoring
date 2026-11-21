import { ErrorState, Link } from '@kompas/ui';
import type { ReactNode } from 'react';
import { href, parseRoute, type Route, useHash } from './lib/router';
import { ReviewBar } from './review/review-bar';
import { P1Home } from './screens/p1-home';
import { P2Search } from './screens/p2-search';
import { P3Profile } from './screens/p3-profile';
import { P4Auth } from './screens/p4-auth';
import { PlannedScreen } from './screens/planned-screen';
import type { ScreenId } from './screens/registry';
import { U1PickSlot } from './screens/u1-pick-slot';
import { U2Checkout } from './screens/u2-checkout';
import { U3Confirmation } from './screens/u3-confirmation';
import { U4Sessions } from './screens/u4-sessions';
import { U5SessionDetail } from './screens/u5-session-detail';
import {
  gateFor,
  LoginGate,
  PendingMentorGate,
  RoleGate,
  SignedInGate,
} from './shell/gates';
import { ProductShell } from './shell/product-shell';
import { ScreenFrame } from './shell/screen-frame';
import { useDemo } from './state/demo-context';

type ScreenComponent = (props: { route: Route }) => ReactNode;

const BUILT: Partial<Record<ScreenId, ScreenComponent>> = {
  P1: P1Home,
  P2: P2Search,
  P3: P3Profile,
  P4: P4Auth,
  U1: U1PickSlot,
  U2: U2Checkout,
  U3: U3Confirmation,
  U4: U4Sessions,
  U5: U5SessionDetail,
};

function ScreenContent({ route }: { route: Route }) {
  const { account } = useDemo();
  const screen = route.screen;
  if (!screen) {
    return (
      <ErrorState
        titleAs="h1"
        title="Nie ma takiej strony"
        description="Ten adres nie należy do mapy ekranów. Wybierz ekran w pasku przeglądu albo wróć na stronę główną."
        action={<Link href={href('/')}>Strona główna</Link>}
      />
    );
  }
  switch (gateFor(screen, account)) {
    case 'login':
      return <LoginGate returnTo={route.path} />;
    case 'role':
      return <RoleGate screen={screen} account={account} />;
    case 'pending-mentor':
      return <PendingMentorGate />;
    case 'signed-in':
      return <SignedInGate account={account} />;
    case 'open': {
      const Screen = BUILT[screen.id];
      return Screen ? <Screen route={route} /> : <PlannedScreen screen={screen} />;
    }
  }
}

export function App() {
  const hash = useHash();
  const route = parseRoute(hash);
  return (
    <>
      <ReviewBar current={route.screen} />
      <ScreenFrame screen={route.screen}>
        <ProductShell screen={route.screen}>
          <ScreenContent key={route.path} route={route} />
        </ProductShell>
      </ScreenFrame>
    </>
  );
}
