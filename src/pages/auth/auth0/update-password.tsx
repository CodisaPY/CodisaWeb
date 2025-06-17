import { Helmet } from "react-helmet-async";

import { CONFIG } from "src/config-global";

import { UpdatePasswordView } from "src/sections/user/view/update-password-view";

const metadata = { title: `Cambio de Contraseña | Seguridad - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <UpdatePasswordView />
    </>
  );
}
