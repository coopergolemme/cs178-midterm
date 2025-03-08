function getParams() {
  const placementStatus = "PlacementStatus";
  return {
    column: placementStatus,
    value: "NotPlaced",
  };
}

function update() {
  params = getParams();
  fetch("/update", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(params),
    cache: "no-cache",
    headers: new Headers({
      "content-type": "application/json",
    }),
  }).then(async function (response) {
    const data = await response.text();
    if (response.ok) {
      document.getElementById("content").innerHTML = data;
    } else {
      console.error("Error:", data);
      alert("Error: " + data);
    }
  });
}
