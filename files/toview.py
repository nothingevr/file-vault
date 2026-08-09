# import pyvista as pv
#
# mesh = pv.read("model.obj")
# mesh.plot()


# import pyvista as pv
#
# mesh = pv.read("model.obj")
#
# mesh = mesh.clean()
# mesh = mesh.triangulate()
#
# mesh.plot(show_edges=True)


import pyvista as pv

mesh = pv.read("model2.obj")
mesh = mesh.clean().triangulate()

p = pv.Plotter()

p.set_background("black")

p.add_points(
    mesh.points,
    color="cyan",
    point_size=4,
    render_points_as_spheres=True,
)

# p.add_mesh(mesh, color="silver", smooth_shading=True)
#
# p.add_mesh(
#     mesh,
#     style="wireframe",
#     color="black",
#     line_width=1,
# )

# p.add_mesh(
#     mesh,
#     pbr=True,
#     metallic=0.6,
#     roughness=0.25,
#     smooth_shading=True,
# )

# p.add_mesh(
#     mesh,
#     color="white",
#     smooth_shading=True,
#     ambient=0.2,
#     diffuse=0.8,
#     specular=0.8,
#     specular_power=80,
# )

# p.add_mesh(
#     mesh,
#     color="lightsteelblue",
#     smooth_shading=True,
#     specular=0.4,
#     specular_power=30,
#     metallic=0.2,
#     roughness=0.5,
# )

p.enable_ssao()  # Ambient Occlusion
p.enable_anti_aliasing()
p.enable_eye_dome_lighting()

p.show()
