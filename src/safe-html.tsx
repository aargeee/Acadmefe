interface SafeHtmlProps {
    html: string;
  }
  
  const SafeHtml = ({ html }: SafeHtmlProps) => {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };
  
  export default SafeHtml;