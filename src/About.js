export default function About() {
  return (
    <>
      <p>geotiff.info is a simple tool that allows you to easily inspect GeoTIFF files.</p>
      <p>
        This tool was built using <a href="https://github.com/azavea/loam">Loam</a>, a library that
        wraps GDAL for use in a web browser.
      </p>
      <p>
        This tool was created by <a href="https://www.azavea.com">Azavea</a>, a technology services
        firm that creates software and data analytics for the web. We are a mission-driven company,
        using our nearly twenty years of geospatial expertise to help our clients address complex
        civic, social, and environmental problems.
      </p>
      <p>
        If you find this tool helpful, consider{" "}
        <a href="https://www.azavea.com/contact-us/">getting in touch</a>! We may be able to help
        you solve other problems, too.
      </p>
      <p>
        If you have problems using this tool or have feature suggestions, please{" "}
        <a href="https://github.com/azavea/loam-geotiff-info/issues">open an issue</a> on the
        project repository.
      </p>
    </>
  );
}
