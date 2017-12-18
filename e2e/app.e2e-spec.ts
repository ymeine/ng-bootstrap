import { AppPage } from './app.po';

describe('tmp App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display framework version', () => {
    page.navigateTo();
    expect(page.getVersionText()).toEqual('1.0.0-beta.7');
  });
});
