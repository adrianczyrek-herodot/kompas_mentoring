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
import { U6VideoRoom } from './screens/u6-video-room';
import { U7Rate } from './screens/u7-rate';
import { U8Plans } from './screens/u8-plans';
import { U9Progress } from './screens/u9-progress';
import { S1Messages } from './screens/s1-messages';
import { S2Notifications } from './screens/s2-notifications';
import { S3Account } from './screens/s3-account';
import { M1Onboarding } from './screens/m1-onboarding';
import { M2Dashboard } from './screens/m2-dashboard';
import { M3Calendar } from './screens/m3-calendar';
import { M4Students } from './screens/m4-students';
import { M5Earnings } from './screens/m5-earnings';
import { A1Verification } from './screens/a1-verification';
import { A2Disputes } from './screens/a2-disputes';
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

const BUILT: Record<ScreenId, ScreenComponent> = {
  P1: P1Home,
  P2: P2Search,
  P3: P3Profile,
  P4: P4Auth,
  U1: U1PickSlot,
  U2: U2Checkout,
  U3: U3Confirmation,
  U4: U4Sessions,
  U5: U5SessionDetail,
  U6: U6VideoRoom,
  U7: U7Rate,
  U8: U8Plans,
  U9: U9Progress,
  S1: S1Messages,
  S2: S2Notifications,
  S3: S3Account,
  M1: M1Onboarding,
  M2: M2Dashboard,
  M3: M3Calendar,
  M4: M4Students,
  M5: M5Earnings,
  A1: A1Verification,
  A2: A2Disputes,
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
      const Comp = Screen;
      return <Comp route={route} />;
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
