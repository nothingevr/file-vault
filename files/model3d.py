import numpy as np
import open3d as o3d
import pandas as pd

# -----------------------
# Load CSV
# -----------------------

df = pd.read_csv("sphere.csv")

points = df[["x", "y", "z"]].to_numpy(dtype=np.float64)

# df = pd.read_csv(
#     "points.csv",
#     sep=r"\s+",
#     names=["x", "y", "z"]
# )
#
# points = df.to_numpy(dtype=float)

# -----------------------
# Create Point Cloud
# -----------------------

pcd = o3d.geometry.PointCloud()
pcd.points = o3d.utility.Vector3dVector(points)

# Remove duplicate points
pcd.remove_duplicated_points()

# Remove statistical outliers
pcd, _ = pcd.remove_statistical_outlier(nb_neighbors=20, std_ratio=2.0)

# -----------------------
# Estimate Normals
# -----------------------

pcd.estimate_normals(
    search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30)
)

pcd.normalize_normals()

# pcd.orient_normals_consistent_tangent_plane(50)
pcd.orient_normals_towards_camera_location(camera_location=np.array([0.0, 0.0, 0.0]))

print("Displaying Point Cloud...")
o3d.visualization.draw_geometries([pcd], window_name="Point Cloud")

# -----------------------
# Poisson Reconstruction
# -----------------------

print("Generating Mesh...")

mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(
    pcd, depth=9
)

# -----------------------
# Remove Low Density Areas
# -----------------------

densities = np.asarray(densities)

vertices_to_remove = densities < np.quantile(densities, 0.02)

mesh.remove_vertices_by_mask(vertices_to_remove)

# -----------------------
# Smooth Mesh
# -----------------------

mesh = mesh.filter_smooth_simple(number_of_iterations=3)

mesh.compute_vertex_normals()

# -----------------------
# Display Mesh
# -----------------------

print("Displaying Mesh...")

o3d.visualization.draw_geometries(
    [mesh], mesh_show_back_face=True, window_name="Reconstructed Mesh"
)

# -----------------------
# Save
# -----------------------

o3d.io.write_triangle_mesh("model2.obj", mesh)
o3d.io.write_triangle_mesh("model.stl", mesh)

print("Saved:")
print(" model.obj")
print(" model.stl")
