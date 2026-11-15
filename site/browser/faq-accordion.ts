import { findElement } from '@site/browser/find-element.ts';

export const startFaqAccordion = () => {
  const faqList = findElement(document, '[data-faq-list]');

  faqList.addEventListener('click', (event) => {
    const clickedButton = event.target instanceof Element ? event.target.closest('.qbtn') : null;
    const isNotQuestionClick = clickedButton == null;
    if (isNotQuestionClick) return;

    const questionBlock = findElement(clickedButton.parentElement ?? faqList, '.ans');
    const isOpening = questionBlock.hidden;
    questionBlock.hidden = !isOpening;
    clickedButton.setAttribute('aria-expanded', String(isOpening));
    clickedButton.parentElement?.classList.toggle('is-open', isOpening);
  });
};
