# 절대 경로 생성을 위한 내장 라이브러리 추가
import os


# ultralytics 패키지에서 YOLO 클래스 불러오기
from ultralytics import YOLO


# 윈도우 멀티프로세싱 충돌 방지를 위한 메인 실행 블록 (반드시 추가!)
if __name__ == '__main__':


    # [1] 모델 로드 (전이 학습의 구조)
    # 백지상태의 모델을 쓸 수도 있지만, 기존에 똑똑한 모델('yolov8n.pt')을
    # 불러와서 시작하는 것(전이학습)이 학습 속도도 빠르고 정확도도 훨씬 높음
    model = YOLO('./custom_models/model_pt/weights/yolov8s-seg.pt')


    # 현재 파이썬 스크립트가 실행되고 있는 폴더의 '절대 경로'를 가져옵니다.
    # 결과 예시: C:\pknu_202601\day75_딥러닝_시작\day91_YOLOv8\YOLO_Project\
    current_dir = os.getcwd()


    # 절대 경로와 'custom_models'를 합쳐서 완벽한 풀(Full) 경로를 만듭니다.
    project_path = os.path.join(current_dir, 'custom_models')


    # [2] 파인튜닝 학습 실행 (model.train)
    # 학습이 완료되면 학습 결과 로그와 최적의 가중치 파일이 반환 및 자동 저장됨
    results = model.train(
        # data: 방금 작성한 데이터셋 설정 파일의 경로
        data='data.yaml',
       
        # epochs: 전체 데이터셋을 처음부터 끝까지 몇 번 반복해서 학습할지 결정
        # 데이터가 적으면 100~300, 많으면 50 정도로 설정
        epochs=300,
       
        # patience: 조기 종료(Early Stopping) 속성
        # 20번의 epoch가 지나는 동안 성능(정확도)이 개선되지 않으면, 시간 낭비를 막기 위해 학습을 스스로 멈춤
        patience=50,
       
        # batch: 한 번의 학습 스텝에 그래픽카드(GPU) 메모리에 올릴 이미지 갯수임
        # GPU 성능에 따라 8, 16, 32 등으로 조절 (메모리 부족 에러가 나면 절반으로 줄이면서 테스트)
        batch=16,
       
        # imgsz: 학습할 때 이미지 크기를 가로세로 640 픽셀로 통일하여 리사이징 처리 (YOLO 기본 규격)
        imgsz=1024,
       
        # device: 연산에 사용할 하드웨어를 지정
        # 0은 첫 번째 NVIDIA GPU를 의미합니다. (GPU가 2개면 0 또는 1 입력 / GPU가 없으면 'cpu' 입력)
        # device="cpu",
        device=0,
       
        ## 추가한 부분 색감관련
        # --- 여기 hsv_h 추가 ---
        # hsv_h=0.01,             # 기본 0.015 -> 색조 변형 폭 줄임 (여드름 홍조 신호 보존)
        # hsv_s=0.5,              # 채도는 기본값 유지 (기본 0.7이면 살짝 낮춰도 됨)
        # hsv_v=0.3,              # 명도(밝기)는 기본값 정도 유지, 조명 다양성 확보
        
        # cache=True,
        # workers=8,

        # close_mosaic=10,

        # project: 학습이 끝난 후 모델 가중치와 그래프 결과물들이 저장될 최상위 폴더 이름
        #  - YOLOv8이 맘대로 runs/를 붙이지 못하도록 '절대 경로'를 직접 입력합니다!
        project= project_path,
       
        # name: 학습별 버전 관리를 위한 이름
        # 결과물은 [My_Custom_Models/train_catdog_v1] 폴더에 저장됩니다.
        name='skin_bi_ato_acne_high_v7_nocol',
       
        # exist_ok: 만약 똑같은 이름의 저장 폴더(name)가 이미 있다면 덮어쓸 것인지(True), 에러를 낼 것인지(False) 결정
        exist_ok=True,
       
        # pretrained: True로 설정하면 기존 'yolov8n.pt'가 가진 지식(가중치)을 그대로 이어받아 학습을 시작함(연장 학습가능)
        pretrained=True
    )
    # results = model.train(
    #     data='data.yaml',

    #     epochs=300,
    #     patience=80,

    #     imgsz=1024,
    #     batch=16,

    #     device=0,

    #     optimizer="AdamW",
    #     lr0=0.001,
    #     cos_lr=True,

    #     cache=True,
    #     workers=8,

    #     close_mosaic=10,

    #     project=project_path,
    #     name='skin_bi_ato_acne_normal_high_v2',

    #     exist_ok=True,
    #     pretrained=True
    # )


    print("파인튜닝 학습이 성공적으로 완료되었습니다!")

