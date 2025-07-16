// Populate the area dropdown when the page loads
window.addEventListener("DOMContentLoaded", async function () {
  // Get the dropdown element from the HTML
  const areaSelect = document.getElementById("area-select");

  // Start with a default option
  areaSelect.innerHTML = '<option value="">Select Area</option>';

  try {
    // Fetch the list of all areas from TheMealDB API
    const response = await fetch(
      "https://www.themealdb.com/api/json/v1/1/list.php?a=list"
    );

    // Convert the response to JSON format
    const data = await response.json();

    // Check if we got areas back from the API
    if (data.meals) {
      // Loop through each area and create an option element
      data.meals.forEach((areaObj) => {
        const option = document.createElement("option");
        option.value = areaObj.strArea; // The value when selected
        option.textContent = areaObj.strArea; // What the user sees
        areaSelect.appendChild(option); // Add it to the dropdown
      });
    }
  } catch (error) {
    // Handle any errors that might occur
    console.error("Error loading areas:", error);
  }
});

// When the user selects an area, fetch and display meals for that area
document
  .getElementById("area-select")
  .addEventListener("change", async function () {
    const area = this.value;
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ""; // Clear previous results

    // If no area is selected, don't fetch anything
    if (!area) {
      // Reset background to default when no area is selected
      document.body.style.background = "";
      return;
    }

    // Set background gradient based on the selected region's flag colors
    const flagColors = {
      American: "linear-gradient(135deg, #B22234, #FFFFFF, #3C3B6E)",
      British: "linear-gradient(135deg, #012169, #FFFFFF, #C8102E)",
      Canadian: "linear-gradient(135deg, #FF0000, #FFFFFF)",
      Chinese: "linear-gradient(135deg, #DE2910, #FFDE00)",
      Croatian: "linear-gradient(135deg, #FF0000, #FFFFFF, #171796)",
      Dutch: "linear-gradient(135deg, #21468B, #FFFFFF, #AE1C28)",
      Egyptian: "linear-gradient(135deg, #CE1126, #FFFFFF, #000000)",
      Filipino: "linear-gradient(135deg, #0038A8, #CE1126, #FCD116, #FFFFFF)",
      French: "linear-gradient(135deg, #0055A4, #FFFFFF, #EF4135)",
      Greek: "linear-gradient(135deg, #0D5EAF, #FFFFFF)",
      Indian: "linear-gradient(135deg, #FF9933, #FFFFFF, #138808)",
      Irish: "linear-gradient(135deg, #009A49, #FFFFFF, #FF7900)",
      Italian: "linear-gradient(135deg, #009246, #FFFFFF, #CE2B37)",
      Jamaican: "linear-gradient(135deg, #009B3A, #FED100, #000000)",
      Japanese: "linear-gradient(135deg, #FFFFFF, #BC002D)",
      Kenyan: "linear-gradient(135deg, #000000, #CC0000, #00A04A, #FFFFFF)",
      Malaysian: "linear-gradient(135deg, #CC0000, #FFFFFF, #010066, #FFCC00)",
      Mexican: "linear-gradient(135deg, #006847, #FFFFFF, #CE1126)",
      Moroccan: "linear-gradient(135deg, #C1272D, #006233)",
      Polish: "linear-gradient(135deg, #FFFFFF, #DC143C)",
      Portuguese: "linear-gradient(135deg, #046A38, #DA020E, #FFD700)",
      Russian: "linear-gradient(135deg, #FFFFFF, #0039A6, #D52B1E)",
      Spanish: "linear-gradient(135deg, #AA151B, #F1BF00, #AA151B)",
      Thai: "linear-gradient(135deg, #A51931, #FFFFFF, #2D2A4A)",
      Tunisian: "linear-gradient(135deg, #E70013, #FFFFFF)",
      Turkish: "linear-gradient(135deg, #E30A17, #FFFFFF)",
      Ukrainian: "linear-gradient(135deg, #0057B7, #FFD700)",
      Vietnamese: "linear-gradient(135deg, #DA020E, #FFFF00)",
    };

    // Apply the background gradient for the selected area
    const gradient =
      flagColors[area] || "linear-gradient(135deg, #667eea, #764ba2)";
    document.body.style.background = gradient;
    document.body.style.minHeight = "100vh"; // Ensure gradient covers full height

    try {
      // Fetch meals for the selected area using the API
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(
          area
        )}`
      );

      // Convert the response to JSON format
      const data = await response.json();

      // Check if we got meals back from the API
      if (data.meals) {
        // Loop through each meal and create a card
        data.meals.forEach(async (meal) => {
          // Create a card container div for each meal
          const mealCard = document.createElement("div");
          mealCard.className = "meal";

          // Create the meal name as an h3 element
          const mealName = document.createElement("h3");
          mealName.textContent = meal.strMeal;

          // Create an image element with the meal thumbnail
          const mealImage = document.createElement("img");
          mealImage.src = meal.strMealThumb;
          mealImage.alt = meal.strMeal; // Use meal name for alt text

          // Create ingredients list
          const ingredientsList = document.createElement("ul");
          ingredientsList.className = "ingredients";
          ingredientsList.style.display = "none"; // Hide ingredients initially

          try {
            // Fetch detailed meal information to get ingredients
            const mealDetailsResponse = await fetch(
              `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
            );
            const mealDetailsData = await mealDetailsResponse.json();

            if (mealDetailsData.meals && mealDetailsData.meals[0]) {
              const mealDetails = mealDetailsData.meals[0];

              // Loop through ingredient properties (strIngredient1 to strIngredient20)
              for (let i = 1; i <= 20; i++) {
                const ingredient = mealDetails[`strIngredient${i}`];
                const measure = mealDetails[`strMeasure${i}`];

                // Only add ingredient if it exists and is not empty
                if (ingredient && ingredient.trim() !== "") {
                  const listItem = document.createElement("li");
                  // Use template literal to format ingredient with measure
                  listItem.textContent = `${
                    measure ? measure.trim() : ""
                  } ${ingredient.trim()}`.trim();
                  ingredientsList.appendChild(listItem);
                }
              }
            }
          } catch (error) {
            // If there's an error getting ingredients, show a simple message
            const errorItem = document.createElement("li");
            errorItem.textContent = "Ingredients not available";
            ingredientsList.appendChild(errorItem);
          }

          // Make the card clickable to open as a pop-up
          mealCard.addEventListener("click", function () {
            // Create pop-up overlay
            const popupOverlay = document.createElement("div");
            popupOverlay.style.position = "fixed";
            popupOverlay.style.top = "0";
            popupOverlay.style.left = "0";
            popupOverlay.style.width = "100%";
            popupOverlay.style.height = "100%";
            popupOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
            popupOverlay.style.display = "flex";
            popupOverlay.style.justifyContent = "center";
            popupOverlay.style.alignItems = "center";
            popupOverlay.style.zIndex = "1000";

            // Create the pop-up meal card
            const popupCard = document.createElement("div");
            popupCard.style.backgroundColor = "white";
            popupCard.style.borderRadius = "10px";
            popupCard.style.padding = "20px";
            popupCard.style.maxWidth = "500px";
            popupCard.style.maxHeight = "80vh";
            popupCard.style.overflow = "auto";
            popupCard.style.position = "relative";
            popupCard.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";

            // Create pop-up content using template literals
            popupCard.innerHTML = `
              <h2 style="margin-top: 0; color: #333;">${meal.strMeal}</h2>
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width: 100%; border-radius: 8px; margin-bottom: 15px;">
              <div class="meal-description" style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; color: #555; line-height: 1.6;">
                Loading description...
              </div>
              <h3 style="color: #555;">Ingredients:</h3>
            `;

            // Fetch meal description from the detailed meal data
            try {
              fetch(
                `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
              )
                .then((response) => response.json())
                .then((detailData) => {
                  if (
                    detailData.meals &&
                    detailData.meals[0] &&
                    detailData.meals[0].strInstructions
                  ) {
                    const description = detailData.meals[0].strInstructions;
                    // Update the description in the pop-up
                    const descriptionElement =
                      popupCard.querySelector(".meal-description");
                    if (descriptionElement) {
                      descriptionElement.textContent = description;
                    }
                  }
                })
                .catch((error) => {
                  console.error("Error fetching meal description:", error);
                  const descriptionElement =
                    popupCard.querySelector(".meal-description");
                  if (descriptionElement) {
                    descriptionElement.textContent =
                      "Description not available";
                  }
                });
            } catch (error) {
              console.error("Error fetching meal description:", error);
            }

            // Clone the ingredients list for the pop-up
            const popupIngredientsList = ingredientsList.cloneNode(true);
            popupIngredientsList.style.display = "block"; // Always show in pop-up
            popupIngredientsList.style.marginBottom = "20px";
            popupCard.appendChild(popupIngredientsList);

            // Create "Back to search" button
            const backButton = document.createElement("button");
            backButton.textContent = "Back to search";
            backButton.style.backgroundColor = "#007bff";
            backButton.style.color = "white";
            backButton.style.border = "none";
            backButton.style.padding = "10px 20px";
            backButton.style.borderRadius = "5px";
            backButton.style.cursor = "pointer";
            backButton.style.fontSize = "16px";
            backButton.style.marginTop = "10px";

            // Add hover effect to button
            backButton.addEventListener("mouseenter", function () {
              backButton.style.backgroundColor = "#0056b3";
            });
            backButton.addEventListener("mouseleave", function () {
              backButton.style.backgroundColor = "#007bff";
            });

            // Close pop-up when back button is clicked
            backButton.addEventListener("click", function () {
              document.body.removeChild(popupOverlay);
            });

            // Close pop-up when clicking outside the card
            popupOverlay.addEventListener("click", function (event) {
              if (event.target === popupOverlay) {
                document.body.removeChild(popupOverlay);
              }
            });

            // Add button to pop-up card
            popupCard.appendChild(backButton);

            // Add pop-up card to overlay
            popupOverlay.appendChild(popupCard);

            // Add overlay to page
            document.body.appendChild(popupOverlay);
          });

          // Add cursor pointer to show it's clickable
          mealCard.style.cursor = "pointer";

          // Add the name, image, and ingredients to the card
          mealCard.appendChild(mealName);
          mealCard.appendChild(mealImage);
          mealCard.appendChild(ingredientsList);

          // Add the card to the results div
          resultsDiv.appendChild(mealCard);
        });
      } else {
        // If no meals found, show a message
        resultsDiv.textContent = "No meals found for this area.";
      }
    } catch (error) {
      // Handle any errors that might occur
      console.error("Error fetching meals:", error);
      resultsDiv.textContent = "Sorry, there was an error loading the meals.";
    }
  });
