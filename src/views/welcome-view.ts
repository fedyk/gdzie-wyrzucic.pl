export function welcomeView() {
  return /*html*/`<div class="welcome">
    <div class="welcome-logo">
      <img class="welcome-logo__img" src="/img/gdzie-wyrzucic.pl.svg" height=24 title="gdzie-wyrzucic.pl" />
    </div>

    <div class="search">
      <form action="/search" method="GET">
        <input class="search__input" name="q" value="" placeholder="gdzie wyrzucic ..." />
        <button type="submit" class="search__btn">Search</button>
      </form>
    </div>
  `
}