import { FAQ_ENTRIES } from "@site/data/faq-entries.ts";
import { SECTION_ANCHORS } from "@site/page/section-anchors.ts";

export const FaqList = () => (
	<section id={SECTION_ANCHORS.faq} class="wrap section">
		<div class="faq">
			<div class="faqhead reveal">
				<h2 class="h2">Questions, answered.</h2>
			</div>
			<div class="faqlist" data-faq-list={true}>
				{FAQ_ENTRIES.map((faqEntry, faqIndex) => {
					const isFirst = faqIndex === 0;

					return (
						<div key={faqEntry.question} class={isFirst ? "q is-open" : "q"}>
							<button
								class="qbtn"
								type="button"
								aria-expanded={String(isFirst)}
							>
								{faqEntry.question}
								<span class="plus">
									<svg
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.6"
										stroke-linecap="round"
										aria-hidden="true"
									>
										<path d="M12 5v14M5 12h14" />
									</svg>
								</span>
							</button>
							<p class="ans" hidden={!isFirst}>
								{faqEntry.answer}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	</section>
);
