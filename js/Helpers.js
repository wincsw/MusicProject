//----------------------------------	
// Takes particle position and outputs which section/slice of the sampling circle it falls into
// slices are 1-12, starting at 3 o'clock position, counter clockwise. e.g. slice 3 is C major on music circle
//----------------------------------
function getSlice(particleX, particleY, sampleX, sampleY, sampleRadius) {
  // Calculate vector from center to particle
  const dx = particleX - sampleX;
  const dy = particleY - sampleY;

  // Check if the particle is outside the circle
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > sampleRadius) {return null;} // Outside the circle

  // Calculate angle from center to particle
  let angle = Math.atan2(-dy, dx); // Invert y to match standard Cartesian direction

  // Normalize angle: atan2 returns from -PI to PI, we convert it to 0 to 2PI
  if (angle < 0) {angle += 2 * Math.PI;}

  // Convert angle to slice index
  const sliceSize = (2 * Math.PI) / 12;
  const sliceIndex = Math.floor(angle / sliceSize);

  return sliceIndex + 1; // Slices are 1-based (1 to 12)
}

//----------------------------------	
// Takes particle entry point and calculates new x,y outside the sample area in the same line
// of sample center and point entry - this will be the center to look for a group
//----------------------------------
function extendFromEntry(centerX, centerY, pointX, pointY, extensionDistance) {
  // Calculate the direction vector from center to the point on the circle
  const dx = pointX - centerX;
  const dy = pointY - centerY;

  // Calculate the current distance (radius)
  const length = Math.sqrt(dx * dx + dy * dy);

  // Normalize the direction vector
  const unitX = dx / length;
  const unitY = dy / length;

  // Compute new extended point
  const extendedX = centerX + (length + extensionDistance) * unitX;
  const extendedY = centerY + (length + extensionDistance) * unitY;

  return { x: extendedX, y: extendedY };
}