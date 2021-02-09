const fs = require('fs');
const path = require('path'); //解析需要遍历的文件夹

const gltfPipeline = require('gltf-pipeline');
const fsExtra = require('fs-extra');
const processGltf = gltfPipeline.processGltf;
const gltfToGlb = gltfPipeline.gltfToGlb;
const glbToGltf = gltfPipeline.glbToGltf;

const options = {
	dracoOptions: {
		// compressMeshes: true,
		compressionLevel: 5,
	},
};

const filePath = path.resolve('./models/');
const outPath = path.resolve('./output/');

if (!fs.existsSync(outPath)) {
	fs.mkdirSync(outPath);
} else {
	emptyDir(outPath);
}

fileDisplay(filePath, outPath);

//文件遍历
function fileDisplay(currentPath, currentOutPath) {
	let files = fs.readdirSync(currentPath);
	files.forEach(filename => {
		let filedir = path.join(currentPath, filename);
		let stats = fs.statSync(filedir);

		console.log('---------');
		console.log('读取目标： ', filedir);
		if (stats.isFile()) {
			// 读取文件内容
			compress(filedir, filename, currentOutPath);
		}
		if (stats.isDirectory()) {
			fileDisplay(filedir, path.join(currentOutPath, filename)); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
		}
	});
}

/**
 * 压缩glb
 * @param {*} filename
 * @param {*} outPath
 */
function compress(filedir, filename, outPath) {
	if (filedir.indexOf('.glb') < 0) return;

	console.log(filedir, ' 开始压缩');
	var glb = fsExtra.readFileSync(filedir);
	glbToGltf(glb).then(function (results) {
		console.log('glb -> gltf 完成');
		processGltf(results.gltf, options).then(function (results) {
			console.log('gltf -> draco gltf 完成');
			gltfToGlb(results.gltf).then(function (results) {
				console.log('gltf -> glb 完成');
				fsExtra.writeFileSync(path.join(outPath, filename), results.glb);
			});
		});
	});
}

/**
 * 循环删除
 * @param {string} dirPath
 */
function emptyDir(dirPath) {
	let files = fs.readdirSync(dirPath);
	files.forEach(filename => {
		let pathname = path.join(dirPath, filename);
		let stats = fs.statSync(pathname);
		if (stats.isFile()) {
			fs.unlinkSync(pathname);
		} else if (stats.isDirectory()) {
			emptyDir(pathname);
		}
	});
}
