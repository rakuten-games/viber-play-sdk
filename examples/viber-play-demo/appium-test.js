document.querySelector('#appium-open').addEventListener('click', () => {
  document.querySelector('#appium-panel').style.display = 'block';
});

document.querySelector('#appium-close').addEventListener('click', () => {
  document.querySelector('#appium-panel').style.display = 'none';
});

document.querySelector('#appium-choose-async').addEventListener('click', () => {
  ViberPlay.context.chooseAsync()
    .then(() => console.log(ViberPlay.context.getID()));
});

document.querySelector('#appium-update-async').addEventListener('click', () => {
  ViberPlay.updateAsync({
    action: 'CUSTOM',
    cta: {
      default: 'Play in l10n fallback',
      localizations: {
        ja_JP: 'Play in ja_JP',
        en_US: 'Play in en_US',
        ru_RU: 'Play in ru_RU',
      },
    },
    template: 'play_turn',
    image: createImg(1200, 1200),
    text: {
      default: 'This is update async test message in l10n fallback',
      localizations: {
        ja_JP: 'This is update async test message in ja_JP',
        en_US: 'This is update async test message in en_US',
        ru_RU: 'This is update async test message in ru_RU',
      },
    },
    data: {foo: 'bar'},
    strategy: 'IMMEDIATE',
  }).then(() => console.log('ok'));
});
