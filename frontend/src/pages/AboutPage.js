import React from "react";
import "../styles/AboutPage.css";

const AboutPage = () => {
  return (
    <div className="about-page">
      <h1></h1>
      <h1></h1>
      <h1></h1>
      <h1>Nova Hotel</h1>
      <h1></h1>
      <h1></h1>

      <section className="about-intro">
        <h2>Our Story</h2>
        <p><strong>
        Nova Hotel emerged from a dream to redefine hospitality—a sanctuary where
        every guest feels both pampered and inspired. Nestled in the vibrant pulse
        of the city, our doors open to a world where historic charm intertwines with
        contemporary luxury. Since 2010, we’ve welcomed explorers, dreamers, and storytellers
        from every corner of the globe, crafting unforgettable moments against the backdrop
        of our iconic skyline.
        </strong></p>
        <p><strong>
        Here, your journey begins with more than a stay; it begins with an experience.
        Imagine waking to the aroma of freshly brewed coffee, sunlight streaming
        through floor-to-ceiling windows, and the murmur of the city below—a symphony
        of possibilities waiting just outside your door.
        </strong></p>
      </section>

      <section className="about-values">
        <h2>Our Values</h2>
        <ul>
          <li>
            <strong>✨ Excellence in Service: </strong><p> "Your comfort is our compass."
            From personalized concierge services to anticipating your needs before you ask, our team embodies warmth and precision.</p>
          </li>
          <li>
            <strong>🌿 Sustainable Luxury: </strong><p>We tread lightly on the planet. Enjoy organic linens, zero-waste dining, and energy-efficient design—all part of our pledge to a greener future.</p>
          </li>
          <li>
            <strong>🍴 Culinary Artistry: </strong><p> Led by award-winning Chef John Smith, our kitchens transform locally sourced ingredients into masterpieces. Taste the region’s soul in every bite.</p>
          </li>
          <li>
            <strong>🤝 Community Heartbeat: </strong><p> We’re woven into the city’s fabric.
            Through scholarships for local students and partnerships with nearby farms, we grow with our community.</p>
          </li>
        </ul>
      </section>

      <section className="about-team">
        <h2>Meet the Visionaries</h2>
        <p>
        Our team is the heartbeat of Nova Hotel—a family of passionate creators dedicated to your story.
        </p>
        <p>Meet some of our key team members:</p>
        <ul>
          <li>
            <strong>Jane Doe, General Manager: </strong><p> “Great hospitality is about creating moments that linger in memory long after checkout.”
            With 15+ years curating luxury stays, Jane ensures every detail feels effortless.</p>
          </li>
          <li>
            <strong>John Smith, Culinary Director: </strong><p> “Food is a love letter to culture.”
            A pioneer of farm-to-table dining, John’s menus celebrate seasonal abundance.</p>
          </li>
          <li>
            <strong>Alice Johnson, Guest Experience Curator: </strong><p> “Your joy is my mission.”
            From surprise birthday setups to hidden local gems, Alice crafts personalized magic.</p>
          </li>
        </ul>
      </section>

      <section className="about-community">
        <h2>Rooted in Community</h2>
        <p>
        We believe in giving back as fiercely as we welcome in:
        </p>
        <ul>
          <li><strong>Nova Cares Initiative: </strong><p>Donates 5% of every stay to urban green spaces.</p></li>
          <li><strong>Local Artisan Collaborations: </strong><p>Your minibar features craft spirits from the distillery down the street.</p></li>
          <li><strong>Cultural Celebrations: </strong><p>Monthly rooftop gatherings spotlighting local musicians and chefs.</p></li>
        </ul>
      </section>

    <section className="community">
    <h2>A Stay That Gives Back</h2>
    <p>
    Book our Eco-Luxe Package and we’ll plant a tree in your name. Or join our Cultural Immersion Weekends, where 100% of proceeds fund arts education for city youth.
    </p>
  </section>
  <section className="meow">
    <h2>Your Story Starts Here</h2>
    <p>At Nova Hotel, you’re not just a guest—you’re part of a legacy. Let us turn your stay into a chapter worth remembering.</p>
    <p>Discover more. Dream louder. Stay Nova.</p>
  </section>
</div>
  );
};

export default AboutPage;
