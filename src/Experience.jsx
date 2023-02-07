import { OrbitControls, shaderMaterial } from "@react-three/drei";
import gsap from "gsap";
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";
import { useEffect, useRef } from "react";
import { Raycaster, Vector2, Vector3 } from "three";
import { extend, useFrame, useThree } from "@react-three/fiber";

export default function Experience() {
  const { camera } = useThree();
  const shader = useRef();
  const points = useRef();
  let hover = false;

  const MyPointsMat = shaderMaterial(
    {
      u_Point: { value: new Vector3(0, 0, 0) },
      u_Intersect: { value: false },
      u_Hover: { value: 0 },
      u_Time: { value: 0 },
    },
    vertex,
    fragment
  );

  const raycaster = new Raycaster();
  raycaster.params.Points.threshold = 0.1;

  const point = new Vector3();
  const mouse = new Vector2();

  function animateHover(value) {
    gsap.to(shader.current.uniforms.u_Hover, {
      value: value,
      duration: 1.0,
      ease: "power2.out",
    });
  }

  useEffect(() => {
    window.addEventListener("mousemove", (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  });

  useFrame(({ clock }) => {
    shader.current.uniforms.u_Time.value = clock.elapsedTime;
    raycaster.setFromCamera(mouse, camera);
    const intersect = raycaster.intersectObject(points.current);

    if (intersect.length === 0) {
      if (hover) {
        hover = false;
        animateHover(0);
      }
    } else {
      if (!hover) {
        hover = true;
        animateHover(1);
      }
    }

    if (intersect.length > 0) {
      gsap.to(point, {
        x: () => intersect[0].point.x,
        y: () => intersect[0].point.y,
        z: () => intersect[0].point.z,
        overwrite: true,
        duration: 0.3,
        onUpdate: () => {
          shader.current.uniforms.u_Point.value = point;
        },
      });
    }
  });

  extend({ MyPointsMat });

  return (
    <>
      <points ref={points}>
        <icosahedronGeometry args={[1, 25]} />
        <myPointsMat ref={shader} />
      </points>
    </>
  );
}
