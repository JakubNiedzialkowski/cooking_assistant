# Cooking assistant

Cooking assistant is a progressive web application(PWA) built for mobile devices in Ionic Framework. The goal of the application is to aid users in the process of perparing meals through providing information for for every step of a recipe. Recipes are stored persistently in local memory of the device and they can be created, read, updated and deleted. Each recipes stores the recipe image, steps needed to complete the recipe and the ingredients list. The application supports preparing multiple recipes simultaneously. It utilizes a two-way voice interface allowing control of the program without the need of using hands which can be troublesome in kitchen environment. Cooking assistant will guide the user through each step of the recipe with predetermined time for each step. The timer can be paused and resumed. Lastly it features a recipe suggestion system based on user’s past actions within the application.

This project served as learning experience for Ionic Framework and developing multi-platform applications using the PWA technology. Cooking assistant was meant to ease the experience of cooking for beginner cooks and people struggling with various impairments thanks to the use of multimodal interfaces. Currently the only supported language is Polish and the two-way voice interface is only supported by mobile devices.

# Development server

To run this application use `ionic serve -o` in the command line. This will run the development server and open the application in your default browser.

# Running the application on a mobile device

To run this application on a mobile device use `ionic cordova run <platform>` where `<platform>` signifies mobile device's platform. For most users this will be `android` or `ios`. For development purposes remember to connect the device to the computer and enable USB debugging on the mobile device.

# Supported list of voice commands

- Przygotuj|Gotuj|Usmaż <recipe_name>: Begin cooking specified recipe.
- Zakończ przygotowywanie|Zakończ gotowanie|Zakończ smażenie <recipe_name>: Prematurely ends cooking of specified active recipe.
- Otwórz przepis|Pokaż przepis|Wyświetl przepis <recipe_name>: Opens specified recipe page.
- Wstrzymaj przygotowywanie|Wstrzymaj gotowanie|Wstrzymaj smażenie <recipe_name>: Pauses timer on specified active recipe.
- Wznów przygotowywanie|Wznów gotowanie|Wznów smażenie <recipe_name>: Resumes timer on specified paused recipe.
- Następny krok <recipe_name>: Advances to next preparation step for specified recipe.
- Cofnij krok|Poprzedni krok <recipe_name>: Goes back to previous step for specified recipe.

# Application GUI showcase

## Home screen with recipes(left) and the side nav menu(right)
![Home screen with recipes and the side menu](https://user-images.githubusercontent.com/26775821/134899068-d9f33e62-a977-415d-8c3a-89a630f2d342.png)

## Recipe screen(left) and Actively cooked recipe screen(right)
![Recipe screen and actively cooked recipe screen](https://user-images.githubusercontent.com/26775821/134899644-01b13456-5bbc-414f-9358-5110c66aa340.png)

## Recipe deletion prompt
![Recipe deletion prompt](https://user-images.githubusercontent.com/26775821/134899807-b6d69106-84ad-4ab1-bb0e-e7566c1dfc9b.jpg)



