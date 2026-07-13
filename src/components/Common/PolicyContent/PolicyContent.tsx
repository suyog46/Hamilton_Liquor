interface PolicySection {
  heading: string;
  body: string[];
}

const PolicyContent = ({ sections }: { sections: PolicySection[] }) => {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="max-w-[860px] mx-auto px-6 flex flex-col gap-10">
        {sections.map((section) => (
          <div key={section.heading} className="flex flex-col gap-3">
            <h2 className="font-title text-xl sm:text-2xl font-bold text-black">{section.heading}</h2>
            {section.body.map((paragraph, i) => (
              <p key={i} className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        ))}
        <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
          This page is a placeholder for design and planning purposes. Final policy wording will be reviewed by
          Hamilton Liquor Store and confirmed with the appropriate Maryland/Baltimore licensing authority before
          launch.
        </p>
      </div>
    </section>
  );
};

export default PolicyContent;
