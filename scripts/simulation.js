let Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies;

Matter.Resolver._restingThresh = 0.001;

let engine = Engine.create();

const simulationWidth = 600;
const simulationHeight = 700;

let g1Parameters = {
    numParticles: 5000,
    mass: 10,
    velocity: 10,
    radius: 1,
};

let g2Parameters = {
    numParticles: 100,
    mass: 10,
    velocity: 20,
    radius: 5,
};

let simulationDiv = document.getElementById("simulation");

// Create a renderer
let render = Render.create({
    element: simulationDiv,
    engine: engine,
    options: {
        width: simulationWidth,
        height: simulationHeight,
        wireframes: false,
    },
});

// Run the renderer
Render.run(render);

// Disable gravity
engine.world.gravity.y = 0;
engine.positionIterations = 10;

let wallThickness = 50;
let middleWallThickness = 50;
let middleWall;

function addStaticBodies() {
    // Create walls
    let wallOptions = {
        isStatic: true,
        restitution: 1,
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
    };

    // Outer walls
    let ground = Bodies.rectangle(
        simulationWidth / 2,
        simulationHeight,
        simulationWidth,
        wallThickness,
        wallOptions
    );
    let ceiling = Bodies.rectangle(
        simulationWidth / 2,
        0,
        simulationWidth,
        wallThickness,
        wallOptions
    );
    let leftWall = Bodies.rectangle(
        0,
        simulationHeight / 2,
        wallThickness,
        simulationHeight,
        wallOptions
    );
    let rightWall = Bodies.rectangle(
        simulationWidth,
        simulationHeight / 2,
        wallThickness,
        simulationHeight,
        wallOptions
    );

    // Middle wall
    middleWall = Bodies.rectangle(
        simulationWidth / 2,
        simulationHeight / 2,
        middleWallThickness,
        simulationHeight,
        wallOptions
    );

    // Add walls to the world
    World.add(engine.world, [ground, ceiling, leftWall, rightWall]);
    World.add(engine.world, [middleWall]);
}

addStaticBodies();

// Function to add a ball with random position, velocity, and radius
function addRandomBall(
    xMin,
    xMax,
    yMin,
    yMax,
    label,
    mass,
    color,
    velocity,
    radius
) {
    let ball = Bodies.circle(
        xMin + Math.random() * (xMax - xMin), // Random x within specified interval
        yMin + Math.random() * (yMax - yMin), // Random y within specified interval
        radius, // Use the radius parameter
        {
            inertia: Infinity,
            restitution: 1,
            friction: 0,
            frictionAir: 0,
            frictionStatic: 0,
            label: label, // Assigning the label
            mass: mass, // Assigning mass
            render: {
                fillStyle: color, // Assigning color
            },
        }
    );

    // Set specified velocity
    Matter.Body.setVelocity(ball, {
        x: velocity.x,
        y: velocity.y,
    });

    World.add(engine.world, ball);
}

n = 5000;
m = 100;

// Adjusted margins to give more space from the middle wall and edges
let margin = 60;

Engine.run(engine);

function calculateAndDispatchAverageKineticEnergy() {
    let bodies = Matter.Composite.allBodies(engine.world);
    let totalKEG1 = 0,
        totalKEG2 = 0;
    let countG1 = 0,
        countG2 = 0;

    bodies.forEach((body) => {
        if (body.label === "G1" || body.label === "G2") {
            let velocityMagnitude = Math.sqrt(
                body.velocity.x ** 2 + body.velocity.y ** 2
            );
            let kineticEnergy = 0.5 * body.mass * velocityMagnitude ** 2;

            if (body.label === "G1") {
                totalKEG1 += kineticEnergy;
                countG1++;
            } else if (body.label === "G2") {
                totalKEG2 += kineticEnergy;
                countG2++;
            }
        }
    });

    let averageKEG1 = countG1 > 0 ? totalKEG1 / countG1 : 0;
    let averageKEG2 = countG2 > 0 ? totalKEG2 / countG2 : 0;

    document.dispatchEvent(
        new CustomEvent("update-kinetic-energy-chart", {
            detail: { averageKEG1, averageKEG2 },
        })
    );
}

setInterval(calculateAndDispatchAverageKineticEnergy, 1000);

document.getElementById("removeWall").addEventListener("click", function () {
    World.remove(engine.world, middleWall);
});

function setDefaultValuesInHTML() {
    document.getElementById("g1NumParticles").value =
        g1Parameters.numParticles || 5000;
    document.getElementById("g1Mass").value = g1Parameters.mass || 10;
    document.getElementById("g1Velocity").value = g1Parameters.velocity || 10;
    document.getElementById("g1Radius").value = g1Parameters.radius || 1;

    document.getElementById("g2NumParticles").value =
        g2Parameters.numParticles || 100;
    document.getElementById("g2Mass").value = g2Parameters.mass || 10;
    document.getElementById("g2Velocity").value = g2Parameters.velocity || 20;
    document.getElementById("g2Radius").value = g2Parameters.radius || 5;
}

function updateParametersFromHTML() {
    g1Parameters.numParticles =
        parseInt(document.getElementById("g1NumParticles").value) || 5000;
    g1Parameters.mass =
        parseFloat(document.getElementById("g1Mass").value) || 10;
    g1Parameters.velocity =
        parseFloat(document.getElementById("g1Velocity").value) || 10;
    g1Parameters.radius =
        parseFloat(document.getElementById("g1Radius").value) || 1;

    g2Parameters.numParticles =
        parseInt(document.getElementById("g2NumParticles").value) || 100;
    g2Parameters.mass =
        parseFloat(document.getElementById("g2Mass").value) || 10;
    g2Parameters.velocity =
        parseFloat(document.getElementById("g2Velocity").value) || 20;
    g2Parameters.radius =
        parseFloat(document.getElementById("g2Radius").value) || 5;
}

// Call this function at the start of your simulation or when you want to update the parameters and recreate the balls
function createBalls() {
    updateParametersFromHTML();

    Matter.World.clear(engine.world);
    Matter.Engine.clear(engine);

    addStaticBodies();

    for (let i = 0; i < g1Parameters.numParticles; i++) {
        addRandomBall(
            wallThickness,
            simulationWidth / 2 - middleWallThickness / 2 - margin,
            wallThickness,
            simulationHeight - wallThickness,
            "G1",
            g1Parameters.mass,
            "#F55A3C", // Color: Red
            {
                x: (Math.random() - 0.5) * g1Parameters.velocity,
                y: (Math.random() - 0.5) * g1Parameters.velocity,
            },
            g1Parameters.radius
        );
    }

    for (let i = 0; i < g2Parameters.numParticles; i++) {
        addRandomBall(
            simulationWidth / 2 + middleWallThickness / 2 + margin,
            simulationWidth - wallThickness,
            wallThickness,
            simulationHeight - wallThickness,
            "G2",
            g2Parameters.mass,
            "#F5D259", // Color: Yellow
            {
                x: (Math.random() - 0.5) * g2Parameters.velocity,
                y: (Math.random() - 0.5) * g2Parameters.velocity,
            },
            g2Parameters.radius
        );
    }
}

setDefaultValuesInHTML();
createBalls();
