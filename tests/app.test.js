import { describe, expect, it } from "vitest";
import { TestDriver } from "testdriverai/vitest/hooks";

describe("Y-H Events Application", () => {
  it("loads the home page and allows navigating to login and provider registration", async (context) => {
    const testdriver = TestDriver(context);

    await testdriver.provision.chrome({
      url: process.env.APP_URL || "https://bandwidth-glenn-folder-port.trycloudflare.com",
    });

    const homeHeading = await testdriver.assert(
      "the homepage heading 'Trouvez le prestataire parfait pour votre événement' is visible"
    );
    expect(homeHeading).toBeTruthy();

    await testdriver.pressKeys(["escape"]);

    await testdriver.find("Connexion navigation link").click();

    const loginHeading = await testdriver.assert(
      "the Connexion heading and Se connecter button are visible on the login page"
    );
    expect(loginHeading).toBeTruthy();

    await testdriver.find("Admin role tab button").click();

    const adminField = await testdriver.assert(
      "the Email field is visible for the Admin login role"
    );
    expect(adminField).toBeTruthy();

    await testdriver.find("Email input field").click();
    await testdriver.type("admin@yh-events.dz");

    await testdriver.find("Mot de passe input field").click();
    await testdriver.type("MonMotDePasseUltraSecurise2025!", { secret: true });

    await testdriver.find("Créer un compte link").click();

    const registerHeading = await testdriver.assert(
      "the provider registration heading Rejoignez Y-H Events and username input are visible"
    );
    expect(registerHeading).toBeTruthy();
  });
});
